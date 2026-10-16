<?php

namespace App\Services;

use App\Models\Order;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetaCapiService
{
    public const API_VERSION = 'v21.0';

    /**
     * Check if Meta Pixel & CAPI is properly configured
     */
    public static function isConfigured(): bool
    {
        $pixelId = trim((string) SiteSetting::get('meta_pixel_id', ''));
        $token = trim((string) SiteSetting::get('meta_capi_token', ''));
        $enabled = SiteSetting::get('meta_capi_enabled', '0') === '1';

        return $enabled && !empty($pixelId) && !empty($token);
    }

    /**
     * Normalize and hash user data for Meta Advanced Matching
     */
    public static function hashData(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }

        return hash('sha256', strtolower(trim($value)));
    }

    /**
     * Normalize Bangladeshi / International phone number and hash with SHA256
     */
    public static function hashPhone(?string $phone): ?string
    {
        if (empty($phone)) {
            return null;
        }

        // Remove spaces, hyphens, parentheses
        $clean = preg_replace('/[^0-9]/', '', $phone);

        // Prepend Bangladesh country code if local 01xxxxxxxxx
        if (str_starts_with($clean, '01') && strlen($clean) === 11) {
            $clean = '88' . $clean;
        }

        return hash('sha256', $clean);
    }

    /**
     * Send Purchase Event to Meta Conversions API (CAPI)
     */
    public static function sendPurchaseEvent(Order $order, ?Request $request = null): bool
    {
        try {
            if (!self::isConfigured()) {
                return false;
            }

            $pixelId = trim((string) SiteSetting::get('meta_pixel_id', ''));
            $token = trim((string) SiteSetting::get('meta_capi_token', ''));
            $testEventCode = trim((string) SiteSetting::get('meta_test_event_code', ''));

            $req = $request ?: request();

            // Extract user data
            $userData = [
                'client_ip_address' => $req->ip(),
                'client_user_agent' => $req->userAgent(),
            ];

            if ($order->customer_email) {
                $userData['em'] = [self::hashData($order->customer_email)];
            }

            if ($order->customer_phone) {
                $userData['ph'] = [self::hashPhone($order->customer_phone)];
            }

            if ($order->customer_name) {
                // Take first name
                $parts = explode(' ', trim($order->customer_name));
                $userData['fn'] = [self::hashData($parts[0])];
            }

            if ($order->district) {
                $userData['ct'] = [self::hashData($order->district)];
            }

            // Country code (bd)
            $userData['country'] = [self::hashData('bd')];

            // External ID for cross-device customer matching
            if ($order->customer_phone) {
                $userData['external_id'] = [self::hashPhone($order->customer_phone)];
            }

            // Capture Meta cookies if present
            $fbp = $req->cookie('_fbp');
            if ($fbp) {
                $userData['fbp'] = $fbp;
            }

            $fbc = $req->cookie('_fbc');
            if ($fbc) {
                $userData['fbc'] = $fbc;
            }

            // Prepare contents
            $contents = [];
            $contentIds = [];
            foreach ($order->items as $item) {
                $id = (string) ($item->product_id ?: $item->id);
                $contentIds[] = $id;
                $contents[] = [
                    'id' => $id,
                    'quantity' => (int) $item->quantity,
                    'item_price' => (float) $item->price,
                ];
            }

            $eventData = [
                'event_name' => 'Purchase',
                'event_time' => time(),
                // Deduplication key matching Browser Pixel
                'event_id' => 'order_' . $order->order_number,
                'event_source_url' => url('/order-success/' . $order->id),
                'action_source' => 'website',
                'user_data' => $userData,
                'custom_data' => [
                    'currency' => 'BDT',
                    'value' => (float) $order->total,
                    'content_type' => 'product',
                    'contents' => $contents,
                    'content_ids' => $contentIds,
                    'num_items' => count($contents),
                    'order_id' => $order->order_number,
                    'payment_method' => $order->payment_method ?: 'cash_on_delivery',
                    'delivery_area' => $order->delivery_area ?: 'inside_dhaka',
                ],
            ];

            $payload = [
                'data' => [$eventData],
            ];

            if (!empty($testEventCode)) {
                $payload['test_event_code'] = $testEventCode;
            }

            $url = "https://graph.facebook.com/" . self::API_VERSION . "/{$pixelId}/events";

            $response = Http::withToken($token)
                ->timeout(5)
                ->post($url, $payload);

            if ($response->successful()) {
                Log::info('[Meta CAPI] Purchase event dispatched successfully', [
                    'order_number' => $order->order_number,
                    'event_id' => 'order_' . $order->order_number,
                    'events_received' => $response->json('events_received'),
                    'fbtrace_id' => $response->json('fbtrace_id'),
                ]);
                return true;
            }

            Log::warning('[Meta CAPI] Event dispatch returned error', [
                'order_number' => $order->order_number,
                'status' => $response->status(),
                'response' => $response->json(),
            ]);
            return false;
        } catch (\Throwable $e) {
            Log::error('[Meta CAPI] Failed to dispatch Purchase event: ' . $e->getMessage(), [
                'order_id' => $order->id ?? null,
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    /**
     * Send a live Test Event to verify API credentials
     */
    public static function sendTestEvent(?string $customTestCode = null): array
    {
        $pixelId = trim((string) SiteSetting::get('meta_pixel_id', ''));
        $token = trim((string) SiteSetting::get('meta_capi_token', ''));
        $testCode = $customTestCode ?: trim((string) SiteSetting::get('meta_test_event_code', ''));

        if (empty($pixelId)) {
            return [
                'success' => false,
                'message' => 'Meta Pixel ID সেট করা হয়নি।',
            ];
        }

        if (empty($token)) {
            return [
                'success' => false,
                'message' => 'Conversions API Access Token সেট করা হয়নি।',
            ];
        }

        try {
            $payload = [
                'data' => [
                    [
                        'event_name' => 'PageView',
                        'event_time' => time(),
                        'event_id' => 'test_' . uniqid(),
                        'event_source_url' => url('/dashboard/settings/meta-pixel'),
                        'action_source' => 'website',
                        'user_data' => [
                            'client_ip_address' => request()->ip(),
                            'client_user_agent' => request()->userAgent(),
                        ],
                        'custom_data' => [
                            'test_note' => 'Bazar Ghor Meta CAPI connection test',
                        ],
                    ],
                ],
            ];

            if (!empty($testCode)) {
                $payload['test_event_code'] = $testCode;
            }

            $url = "https://graph.facebook.com/" . self::API_VERSION . "/{$pixelId}/events";

            $response = Http::withToken($token)
                ->timeout(8)
                ->post($url, $payload);

            if ($response->successful()) {
                $json = $response->json();
                return [
                    'success' => true,
                    'message' => 'কানেকশন সফল! মেটা থেকে ইভেন্ট গ্রহণ করা হয়েছে (' . ($json['events_received'] ?? 1) . ' event received)।' .
                        (!empty($testCode) ? ' আপনার ফেসবুক Events Manager > Test Events ট্যাবে এখনই দেখতে পাবেন।' : ''),
                    'data' => $json,
                ];
            }

            $err = $response->json('error.message') ?: $response->body();
            return [
                'success' => false,
                'message' => 'মেটা API ত্রুটি: ' . $err,
                'status' => $response->status(),
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'সংযোগ ব্যর্থ হয়েছে: ' . $e->getMessage(),
            ];
        }
    }
}
