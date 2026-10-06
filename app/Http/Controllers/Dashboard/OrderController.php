<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::with('items')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q->where('order_number', 'like', "%{$search}%")
                ->orWhere('customer_name', 'like', "%{$search}%")
                ->orWhere('customer_phone', 'like', "%{$search}%"));
        }

        $orders = $query->paginate(15)->through(fn($o) => [
            'id' => $o->id,
            'order_number' => $o->order_number,
            'customer_name' => $o->customer_name,
            'customer_phone' => $o->customer_phone,
            'district' => $o->district,
            'delivery_area' => $o->delivery_area,
            'subtotal' => $o->subtotal,
            'discount' => $o->discount,
            'delivery_charge' => $o->delivery_charge,
            'total' => $o->total,
            'status' => $o->status,
            'status_label' => $o->status_label,
            'status_color' => $o->status_color,
            'items_count' => $o->items->count(),
            'created_at' => $o->created_at->format('d M Y, h:i A'),
        ]);

        return Inertia::render('dashboard/orders/index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'search']),
            'statusCounts' => [
                'all' => Order::count(),
                'pending' => Order::where('status', 'pending')->count(),
                'confirmed' => Order::where('status', 'confirmed')->count(),
                'processing' => Order::where('status', 'processing')->count(),
                'shipped' => Order::where('status', 'shipped')->count(),
                'delivered' => Order::where('status', 'delivered')->count(),
                'cancelled' => Order::where('status', 'cancelled')->count(),
            ],
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load('items');

        return Inertia::render('dashboard/orders/show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'customer_email' => $order->customer_email,
                'division' => $order->division,
                'district' => $order->district,
                'upazila' => $order->upazila,
                'address' => $order->address,
                'delivery_area' => $order->delivery_area,
                'delivery_charge' => $order->delivery_charge,
                'subtotal' => $order->subtotal,
                'coupon_code' => $order->coupon_code,
                'discount' => $order->discount,
                'total' => $order->total,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'status_color' => $order->status_color,
                'payment_method' => $order->payment_method,
                'notes' => $order->notes,
                'created_at' => $order->created_at->format('d M Y, h:i A'),
                'items' => $order->items->map(fn($i) => [
                    'id' => $i->id,
                    'product_name' => $i->product_name,
                    'variant_name' => $i->variant_name,
                    'thumbnail' => $i->thumbnail,
                    'price' => $i->price,
                    'quantity' => $i->quantity,
                    'total' => $i->total,
                ]),
            ],
        ]);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled',
        ]);

        $oldStatus = $order->status;
        $newStatus = $request->status;

        if ($newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
            // Restore inventory and decrease sold count
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
        } elseif ($newStatus !== 'cancelled' && $oldStatus === 'cancelled') {
            // Re-deduct inventory and increase sold count
            $order->loadMissing('items');
            foreach ($order->items as $item) {
                $qty = (int) $item->quantity;
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->increment('sold_count', $qty);
                    if (!$product->has_variants) {
                        $currentStock = (int) $product->stock_quantity;
                        $product->decrement('stock_quantity', min($qty, $currentStock));
                    }
                }
                if ($item->product_variant_id) {
                    $variant = ProductVariant::find($item->product_variant_id);
                    if ($variant) {
                        $currentVStock = (int) $variant->stock_quantity;
                        $variant->decrement('stock_quantity', min($qty, $currentVStock));
                    }
                }
            }
        }

        $order->update(['status' => $newStatus]);

        return back()->with('success', 'অর্ডার স্ট্যাটাস আপডেট হয়েছে।');
    }

    public function destroy(Order $order): RedirectResponse
    {
        $order->delete();
        return redirect()->route('dashboard.orders.index')
            ->with('success', 'অর্ডার মুছে ফেলা হয়েছে।');
    }
}
