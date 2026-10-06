<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SteadfastWebhookController extends Controller
{
    /**
     * Handle incoming SteadFast Courier Webhook events.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        Log::info('SteadFast Webhook received', [
            'payload' => $payload,
            'ip' => $request->ip(),
        ]);

        if (empty($payload)) {
            return response()->json([
                'status' => 400,
                'message' => 'Empty payload received.',
            ], 400);
        }

        // SteadFast sends fields: consignment_id, tracking_code, invoice, status (or delivery_status)
        $consignmentId = $payload['consignment_id'] ?? null;
        $trackingCode = $payload['tracking_code'] ?? null;
        $invoice = $payload['invoice'] ?? $payload['order_id'] ?? null;
        $courierStatus = strtolower(trim((string) ($payload['status'] ?? $payload['delivery_status'] ?? '')));

        if (!$consignmentId && !$trackingCode && !$invoice) {
            return response()->json([
                'status' => 422,
                'message' => 'Missing consignment_id, tracking_code, or invoice.',
            ], 422);
        }

        // Find matching order
        $order = Order::query()
            ->when($consignmentId, fn($q) => $q->orWhere('consignment_id', (string) $consignmentId))
            ->when($trackingCode, fn($q) => $q->orWhere('tracking_code', (string) $trackingCode))
            ->when($invoice, fn($q) => $q->orWhere('order_number', (string) $invoice))
            ->first();

        if (!$order) {
            Log::warning('SteadFast Webhook: Order not found', [
                'consignment_id' => $consignmentId,
                'tracking_code' => $trackingCode,
                'invoice' => $invoice,
            ]);

            return response()->json([
                'status' => 404,
                'message' => 'Order not found.',
            ], 404);
        }

        $updateData = [];

        if ($courierStatus) {
            $updateData['courier_status'] = $courierStatus;
        }
        if ($consignmentId && !$order->consignment_id) {
            $updateData['consignment_id'] = (string) $consignmentId;
        }
        if ($trackingCode && !$order->tracking_code) {
            $updateData['tracking_code'] = (string) $trackingCode;
        }
        if (!$order->courier_name) {
            $updateData['courier_name'] = 'steadfast';
        }

        if (!empty($updateData)) {
            $order->update($updateData);
        }

        // Sync with primary order status based on courier status
        $this->syncOrderStatus($order, $courierStatus);

        return response()->json([
            'status' => 200,
            'message' => 'Webhook processed successfully.',
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'courier_status' => $courierStatus,
        ]);
    }

    /**
     * Map courier status to main Order status and handle stock adjustments if cancelled/returned.
     */
    private function syncOrderStatus(Order $order, string $courierStatus): void
    {
        if (empty($courierStatus)) {
            return;
        }

        $oldStatus = $order->status;
        $targetStatus = null;

        if (in_array($courierStatus, ['delivered', 'partial_delivered', 'paid'])) {
            $targetStatus = 'delivered';
        } elseif (in_array($courierStatus, ['cancelled', 'cancelled_approval_pending', 'return', 'returned'])) {
            $targetStatus = 'cancelled';
        } elseif (in_array($courierStatus, ['in_transit', 'delivering', 'picked_up'])) {
            $targetStatus = 'shipped';
        }

        if ($targetStatus && $targetStatus !== $oldStatus) {
            // If transitioning to cancelled, restore stock
            if ($targetStatus === 'cancelled' && $oldStatus !== 'cancelled') {
                $order->loadMissing('items');
                foreach ($order->items as $item) {
                    $qty = (int) $item->quantity;
                    $product = Product::find($item->product_id);
                    if ($product) {
                        $product->decrement('sold_count', min($qty, (int) $product->sold_count));
                        if (!$product->has_variants) {
                            $product->increment('stock_quantity', $qty);
                        }
                    }
                    if ($item->product_variant_id) {
                        $variant = ProductVariant::find($item->product_variant_id);
                        if ($variant) {
                            $variant->increment('stock_quantity', $qty);
                        }
                    }
                }
            }

            $order->update(['status' => $targetStatus]);
        }
    }
}
