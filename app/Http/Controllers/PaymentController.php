<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Initiate UddoktaPay Payment
     */
    public static function initiateUddoktaPay(Order $order)
    {
        $apiKey = SiteSetting::get('payment_uddoktapay_api_key');
        $baseUrl = SiteSetting::get('payment_uddoktapay_base_url', 'https://checkout.uddoktapay.com/api/checkout-v2');

        if (!$apiKey) {
            throw new \Exception('উদ্যোক্তাপে API Key সেট করা হয়নি। অনুগ্রহ করে এডমিন প্যানেল থেকে কনফিগার করুন।');
        }

        $response = Http::withHeaders([
            'RT-UDDOKTAPAY-API-KEY' => $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->timeout(20)->post(rtrim($baseUrl, '/'), [
            'full_name' => $order->customer_name,
            'email' => $order->customer_email ?: 'order_' . $order->id . '@bazarghor.com',
            'amount' => (string) $order->total,
            'metadata' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ],
            'redirect_url' => route('payment.uddoktapay.success', ['order_id' => $order->id]),
            'cancel_url' => route('checkout'),
            'webhook_url' => route('payment.uddoktapay.webhook'),
        ]);

        if ($response->successful()) {
            $data = $response->json();
            if (!empty($data['payment_url'])) {
                return $data['payment_url'];
            }
        }

        Log::error('UddoktaPay initiation failed', [
            'order_id' => $order->id,
            'response' => $response->body(),
        ]);

        throw new \Exception('পেমেন্ট গেটওয়েতে সংযোগ করতে সমস্যা হয়েছে: ' . ($response->json('message') ?? 'অনুগ্রহ করে আবার চেষ্টা করুন।'));
    }

    /**
     * UddoktaPay Redirect Callback (Success)
     */
    public function uddoktaPaySuccess(Request $request)
    {
        $orderId = $request->query('order_id');
        $order = Order::find($orderId);

        if (!$order) {
            return redirect()->route('home')->with('error', 'অর্ডার খুঁজে পাওয়া যায়নি।');
        }

        $invoiceId = $request->query('invoice_id');
        if ($invoiceId) {
            $order->update([
                'payment_status' => 'paid',
                'status' => 'confirmed',
                'transaction_id' => $invoiceId,
            ]);
        }

        $request->session()->put('last_placed_order_id', $order->id);

        return redirect()->route('order.success', $order->id)->with('success', 'পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!');
    }

    /**
     * UddoktaPay Webhook / IPN
     */
    public function uddoktaPayWebhook(Request $request)
    {
        $headerApiKey = $request->header('RT-UDDOKTAPAY-API-KEY');
        $savedApiKey = SiteSetting::get('payment_uddoktapay_api_key');

        if (!$headerApiKey || $headerApiKey !== $savedApiKey) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $data = $request->all();
        $orderId = $data['metadata']['order_id'] ?? null;

        if ($orderId && ($data['status'] ?? '') === 'COMPLETED') {
            $order = Order::find($orderId);
            if ($order && $order->payment_status !== 'paid') {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'confirmed',
                    'transaction_id' => $data['invoice_id'] ?? $data['transaction_id'] ?? null,
                ]);
            }
        }

        return response()->json(['status' => true]);
    }
}
