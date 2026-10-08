<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\SteadfastService;
use Carbon\Carbon;
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

        if ($request->filled('category_id')) {
            $catId = (int) $request->category_id;
            $query->whereHas('items.product', function ($pq) use ($catId) {
                $pq->where('category_id', $catId)
                   ->orWhereHas('categories', fn($cq) => $cq->where('categories.id', $catId));
            });
        }

        if ($request->filled('date_preset')) {
            $preset = $request->date_preset;
            $today = Carbon::today();
            if ($preset === 'today') {
                $query->whereDate('created_at', $today);
            } elseif ($preset === 'yesterday') {
                $query->whereDate('created_at', Carbon::yesterday());
            } elseif ($preset === 'this_week') {
                $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
            } elseif ($preset === 'this_month') {
                $query->whereYear('created_at', Carbon::now()->year)
                      ->whereMonth('created_at', Carbon::now()->month);
            }
        } else {
            if ($request->filled('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q->where('order_number', 'like', "%{$search}%")
                ->orWhere('customer_name', 'like', "%{$search}%")
                ->orWhere('customer_phone', 'like', "%{$search}%"));
        }

        if ($request->filled('payment_method')) {
            $pm = $request->payment_method;
            if ($pm === 'cash_on_delivery') {
                $query->where(function ($q) {
                    $q->where('payment_method', 'cash_on_delivery')
                      ->orWhereNull('payment_method')
                      ->orWhere('payment_method', '');
                });
            } elseif ($pm === 'online') {
                $query->whereNotNull('payment_method')
                      ->where('payment_method', '!=', 'cash_on_delivery')
                      ->where('payment_method', '!=', '');
            } elseif ($pm === 'uddoktapay') {
                $query->where('payment_method', 'uddoktapay');
            } else {
                $query->where('payment_method', $pm);
            }
        }

        // Summary counts for filtered state
        $filteredCount = (clone $query)->count();
        $filteredTotalAmount = (clone $query)->sum('total');

        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        $orders = $query->paginate(15)->withQueryString()->through(fn($o) => [
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
            'payment_method' => $o->payment_method ?: 'cash_on_delivery',
            'payment_status' => $o->payment_status ?: 'unpaid',
            'courier_name' => $o->courier_name,
            'consignment_id' => $o->consignment_id,
            'tracking_code' => $o->tracking_code,
            'courier_status' => $o->courier_status,
            'items_count' => $o->items->count(),
            'created_at' => $o->created_at->format('d M Y, h:i A'),
        ]);

        return Inertia::render('dashboard/orders/index', [
            'orders' => $orders,
            'categories' => $categories,
            'steadfastConfigured' => SteadfastService::isConfigured(),
            'filters' => $request->only(['status', 'search', 'category_id', 'date_preset', 'date_from', 'date_to', 'payment_method']),
            'filteredSummary' => [
                'count' => $filteredCount,
                'total_amount' => (float) $filteredTotalAmount,
            ],
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
                'courier_name' => $order->courier_name,
                'consignment_id' => $order->consignment_id,
                'tracking_code' => $order->tracking_code,
                'courier_status' => $order->courier_status,
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
            'steadfastConfigured' => SteadfastService::isConfigured(),
        ]);
    }

    public function sendToSteadfast(Order $order): RedirectResponse
    {
        $result = SteadfastService::createOrder($order);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->with('error', $result['message']);
    }

    public function bulkSendToSteadfast(Request $request): RedirectResponse
    {
        $request->validate([
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'exists:orders,id',
        ]);

        if (!SteadfastService::isConfigured()) {
            return back()->with('error', 'SteadFast API Key বা Secret Key কনফিগার করা নেই। সেটিংস থেকে কনফিগার করুন।');
        }

        $orders = Order::whereIn('id', $request->order_ids)->get();
        $successCount = 0;
        $skippedCount = 0;
        $errors = [];

        foreach ($orders as $order) {
            if (!empty($order->tracking_code)) {
                $skippedCount++;
                continue;
            }

            $result = SteadfastService::createOrder($order);
            if ($result['success']) {
                $successCount++;
            } else {
                $errors[] = "#{$order->order_number}: " . $result['message'];
            }
        }

        $msg = "{$successCount}টি অর্ডার সফলভাবে SteadFast-এ বুকিং হয়েছে।";
        if ($skippedCount > 0) {
            $msg .= " ({$skippedCount}টি অর্ডার আগে থেকেই পাঠানো থাকায় স্কিপ করা হয়েছে)";
        }

        if (!empty($errors)) {
            $msg .= " ত্রুটি: " . implode('; ', array_slice($errors, 0, 3));
            return back()->with('warning', $msg);
        }

        return back()->with('success', $msg);
    }

    public function checkSteadfastStatus(Order $order): RedirectResponse
    {
        $result = SteadfastService::checkStatus($order);
        if ($result['success']) {
            return back()->with('success', 'SteadFast স্ট্যাটাস আপডেট হয়েছে: ' . $result['status']);
        }

        return back()->with('error', $result['message'] ?? 'স্ট্যাটাস চেক করা যায়নি।');
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled',
        ]);

        $this->handleOrderStatusChange($order, $request->status);

        return back()->with('success', 'অর্ডার স্ট্যাটাস আপডেট হয়েছে।');
    }

    public function bulkStatus(Request $request): RedirectResponse
    {
        $request->validate([
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'exists:orders,id',
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled',
        ]);

        $orders = Order::whereIn('id', $request->order_ids)->get();

        foreach ($orders as $order) {
            $this->handleOrderStatusChange($order, $request->status);
        }

        return back()->with('success', count($orders) . 'টি অর্ডারের স্ট্যাটাস সফলভাবে আপডেট হয়েছে।');
    }

    private function handleOrderStatusChange(Order $order, string $newStatus): void
    {
        $oldStatus = $order->status;
        if ($oldStatus === $newStatus) {
            return;
        }

        if ($newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
            $this->restoreOrderStock($order);
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
    }

    private function restoreOrderStock(Order $order): void
    {
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

    public function destroy(Order $order): RedirectResponse
    {
        if ($order->status !== 'cancelled') {
            $this->restoreOrderStock($order);
        }
        $order->items()->delete();
        $order->delete();

        return back()->with('success', 'অর্ডার সফলভাবে মুছে ফেলা হয়েছে।');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate([
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'exists:orders,id',
        ]);

        $orders = Order::whereIn('id', $request->order_ids)->get();
        $count = $orders->count();

        foreach ($orders as $order) {
            if ($order->status !== 'cancelled') {
                $this->restoreOrderStock($order);
            }
            $order->items()->delete();
            $order->delete();
        }

        return back()->with('success', "{$count}টি অর্ডার সফলভাবে মুছে ফেলা হয়েছে।");
    }
}
