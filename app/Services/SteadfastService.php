<?php

namespace App\Services;

use App\Models\Order;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SteadfastService
{
    public static function isConfigured(): bool
    {
        $enabled = SiteSetting::get('courier_steadfast_enabled', '0') === '1';
        $apiKey = trim(SiteSetting::get('courier_steadfast_api_key', ''));
        $secretKey = trim(SiteSetting::get('courier_steadfast_secret_key', ''));

        return $enabled && !empty($apiKey) && !empty($secretKey);
    }

    public static function getBaseUrl(): string
    {
        $url = trim(SiteSetting::get('courier_steadfast_base_url', 'https://portal.packzy.com/api/v1'));
        return rtrim($url ?: 'https://portal.packzy.com/api/v1', '/');
    }

    public static function getHeaders(): array
    {
        return [
            'Api-Key' => trim(SiteSetting::get('courier_steadfast_api_key', '')),
            'Secret-Key' => trim(SiteSetting::get('courier_steadfast_secret_key', '')),
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];
    }

    /**
     * Create parcel booking on SteadFast
     */
    public static function createOrder(Order $order): array
    {
        if (!self::isConfigured()) {
            return [
                'success' => false,
                'message' => 'SteadFast API Key বা Secret Key কনফিগার করা হয়নি। সেটিংস থেকে এপিআই কী সেট করুন।',
            ];
        }

        $baseUrl = self::getBaseUrl();
        $defaultNote = SiteSetting::get('courier_steadfast_delivery_note', 'Handle with care');

        $fullAddress = trim($order->address);
        if ($order->upazila) {
            $fullAddress .= ', ' . $order->upazila;
        }
        if ($order->district) {
            $fullAddress .= ', ' . $order->district;
        }

        $codAmount = $order->payment_method === 'cash_on_delivery' ? (float) $order->total : 0.0;

        $payload = [
            'invoice' => (string) $order->order_number,
            'recipient_name' => (string) $order->customer_name,
            'recipient_phone' => (string) $order->customer_phone,
            'recipient_address' => $fullAddress,
            'cod_amount' => $codAmount,
            'note' => (string) ($order->notes ?: $defaultNote),
        ];

        try {
            $response = Http::withHeaders(self::getHeaders())
                ->timeout(20)
                ->post($baseUrl . '/create_order', $payload);

            $data = $response->json();

            if ($response->successful() && isset($data['status']) && $data['status'] === 200) {
                $consignment = $data['consignment'] ?? [];
                $consignmentId = $consignment['consignment_id'] ?? null;
                $trackingCode = $consignment['tracking_code'] ?? null;
                $courierStatus = $consignment['status'] ?? 'in_review';

                $order->update([
                    'courier_name' => 'steadfast',
                    'consignment_id' => $consignmentId ? (string) $consignmentId : null,
                    'tracking_code' => $trackingCode ? (string) $trackingCode : null,
                    'courier_status' => (string) $courierStatus,
                    'status' => 'shipped',
                ]);

                return [
                    'success' => true,
                    'message' => 'SteadFast-এ পার্সেল সফলভাবে বুকিং হয়েছে।',
                    'consignment_id' => $consignmentId,
                    'tracking_code' => $trackingCode,
                    'data' => $consignment,
                ];
            }

            // Error response from Steadfast
            $errMsg = $data['message'] ?? 'SteadFast থেকে পার্সেল তৈরিতে ব্যর্থ হয়েছে।';
            if (!empty($data['errors'])) {
                $flatErrors = collect($data['errors'])->flatten()->implode(', ');
                $errMsg .= ' (' . $flatErrors . ')';
            }

            Log::error('Steadfast order creation failed: ' . $errMsg, [
                'order_id' => $order->id,
                'response' => $data,
            ]);

            return [
                'success' => false,
                'message' => $errMsg,
            ];
        } catch (\Throwable $e) {
            Log::error('Steadfast order creation exception: ' . $e->getMessage(), [
                'order_id' => $order->id,
            ]);

            return [
                'success' => false,
                'message' => 'কানেকশন এরর: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check live delivery status from SteadFast
     */
    public static function checkStatus(Order $order): array
    {
        if (!self::isConfigured()) {
            return ['success' => false, 'message' => 'Steadfast is not configured.'];
        }

        $baseUrl = self::getBaseUrl();

        try {
            $endpoint = null;
            if ($order->consignment_id) {
                $endpoint = $baseUrl . '/status_by_cid/' . $order->consignment_id;
            } elseif ($order->tracking_code) {
                $endpoint = $baseUrl . '/status_by_trackingcode/' . $order->tracking_code;
            } elseif ($order->order_number) {
                $endpoint = $baseUrl . '/status_by_invoice/' . $order->order_number;
            }

            if (!$endpoint) {
                return ['success' => false, 'message' => 'No tracking or consignment ID found.'];
            }

            $response = Http::withHeaders(self::getHeaders())->timeout(15)->get($endpoint);
            $data = $response->json();

            if ($response->successful() && isset($data['delivery_status'])) {
                $status = $data['delivery_status'];
                $order->update(['courier_status' => $status]);

                return [
                    'success' => true,
                    'status' => $status,
                ];
            }

            return [
                'success' => false,
                'message' => $data['message'] ?? 'Status not found',
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
