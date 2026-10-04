<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\SiteSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user() && $request->user()->isCustomer()) {
            return redirect()->route('account.index');
        }

        $totalRevenue = (float) Order::where('status', 'delivered')->sum('total');

        // Calculate Cost of Goods Sold (COGS) for delivered orders
        $deliveredOrders = Order::where('status', 'delivered')->with(['items.product', 'items.variant'])->get();
        $totalCogs = 0;
        foreach ($deliveredOrders as $order) {
            foreach ($order->items as $item) {
                $unitCost = $item->variant?->cost_price ?? $item->product?->cost_price ?? 0;
                $totalCogs += ((float) $unitCost * $item->quantity);
            }
        }

        $marketingCost = (float) SiteSetting::get('marketing_cost', '0');
        $grossProfit = max(0, $totalRevenue - $totalCogs);
        $netProfit = $grossProfit - $marketingCost;

        $stats = [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'confirmed_orders' => Order::where('status', 'confirmed')->count(),
            'delivered_orders' => Order::where('status', 'delivered')->count(),
            'total_revenue' => round($totalRevenue, 2),
            'total_cogs' => round($totalCogs, 2),
            'gross_profit' => round($grossProfit, 2),
            'marketing_cost' => round($marketingCost, 2),
            'net_profit' => round($netProfit, 2),
            'total_products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'total_categories' => Category::count(),
        ];

        $recentOrders = Order::with('items')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'customer_name' => $o->customer_name,
                'customer_phone' => $o->customer_phone,
                'total' => $o->total,
                'status' => $o->status,
                'status_label' => $o->status_label,
                'status_color' => $o->status_color,
                'items_count' => $o->items->count(),
                'created_at' => $o->created_at->format('d M Y, h:i A'),
            ]);

        return Inertia::render('dashboard/index', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
        ]);
    }

    public function updateMarketingCost(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'marketing_cost' => 'required|numeric|min:0',
        ]);

        SiteSetting::set('marketing_cost', (string) $validated['marketing_cost']);

        return back()->with('success', 'মার্কেটিং খরচ সফলভাবে আপডেট করা হয়েছে।');
    }
}
