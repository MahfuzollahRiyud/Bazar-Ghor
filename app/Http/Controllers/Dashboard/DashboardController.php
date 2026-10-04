<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MarketingExpense;
use App\Models\Order;
use App\Models\Product;
use App\Models\SiteSetting;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        if ($request->user() && $request->user()->isCustomer()) {
            return redirect()->route('account.index');
        }

        // 1. Overall / All-Time Primary Stats
        $allDeliveredOrders = Order::where('status', 'delivered')->with(['items.product', 'items.variant'])->get();
        $allTotalRevenue = (float) Order::where('status', 'delivered')->sum('total');
        $allTotalCogs = 0;
        foreach ($allDeliveredOrders as $order) {
            foreach ($order->items as $item) {
                $unitCost = $item->variant?->cost_price ?? $item->product?->cost_price ?? 0;
                $allTotalCogs += ((float) $unitCost * $item->quantity);
            }
        }

        $allMarketingCost = (float) MarketingExpense::sum('amount');
        if (MarketingExpense::count() === 0 && (float) SiteSetting::get('marketing_cost', '0') > 0) {
            $legacyCost = (float) SiteSetting::get('marketing_cost', '0');
            MarketingExpense::create([
                'expense_date' => now()->toDateString(),
                'amount' => $legacyCost,
                'title' => 'পূর্বের মোট মার্কেটিং খরচ',
            ]);
            $allMarketingCost = $legacyCost;
        }

        $allGrossProfit = max(0, $allTotalRevenue - $allTotalCogs);
        $allNetProfit = $allGrossProfit - $allMarketingCost;

        $stats = [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'confirmed_orders' => Order::where('status', 'confirmed')->count(),
            'delivered_orders' => Order::where('status', 'delivered')->count(),
            'total_revenue' => round($allTotalRevenue, 2),
            'total_cogs' => round($allTotalCogs, 2),
            'gross_profit' => round($allGrossProfit, 2),
            'marketing_cost' => round($allMarketingCost, 2),
            'net_profit' => round($allNetProfit, 2),
            'total_products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'total_categories' => Category::count(),
        ];

        // 2. Date Range Filtered Analytics
        $period = $request->input('period', 'this_month');
        $startDate = null;
        $endDate = null;
        $now = now();

        switch ($period) {
            case 'today':
                $startDate = $now->copy()->startOfDay();
                $endDate = $now->copy()->endOfDay();
                break;
            case 'yesterday':
                $startDate = $now->copy()->subDay()->startOfDay();
                $endDate = $now->copy()->subDay()->endOfDay();
                break;
            case 'last_7_days':
                $startDate = $now->copy()->subDays(6)->startOfDay();
                $endDate = $now->copy()->endOfDay();
                break;
            case 'this_month':
                $startDate = $now->copy()->startOfMonth();
                $endDate = $now->copy()->endOfMonth();
                break;
            case 'last_month':
                $startDate = $now->copy()->subMonth()->startOfMonth();
                $endDate = $now->copy()->subMonth()->endOfMonth();
                break;
            case 'this_year':
                $startDate = $now->copy()->startOfYear();
                $endDate = $now->copy()->endOfYear();
                break;
            case 'custom':
                if ($request->filled('start_date')) {
                    $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
                }
                if ($request->filled('end_date')) {
                    $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
                }
                break;
            case 'all':
            default:
                $period = 'all';
                break;
        }

        // Query orders in selected period
        $periodOrdersQuery = Order::query();
        if ($startDate && $endDate) {
            $periodOrdersQuery->whereBetween('created_at', [$startDate, $endDate]);
        } elseif ($startDate) {
            $periodOrdersQuery->where('created_at', '>=', $startDate);
        } elseif ($endDate) {
            $periodOrdersQuery->where('created_at', '<=', $endDate);
        }

        $periodTotalOrders = (clone $periodOrdersQuery)->count();
        $periodPendingOrders = (clone $periodOrdersQuery)->where('status', 'pending')->count();
        $periodConfirmedOrders = (clone $periodOrdersQuery)->where('status', 'confirmed')->count();
        $periodDeliveredOrders = (clone $periodOrdersQuery)->where('status', 'delivered')->count();
        $periodDeliveredRevenue = (float) (clone $periodOrdersQuery)->where('status', 'delivered')->sum('total');

        // COGS for delivered orders in this period
        $periodDeliveredItems = (clone $periodOrdersQuery)
            ->where('status', 'delivered')
            ->with(['items.product', 'items.variant'])
            ->get();

        $periodCogs = 0;
        foreach ($periodDeliveredItems as $order) {
            foreach ($order->items as $item) {
                $unitCost = $item->variant?->cost_price ?? $item->product?->cost_price ?? 0;
                $periodCogs += ((float) $unitCost * $item->quantity);
            }
        }

        // Marketing expenses in this period
        $marketingQuery = MarketingExpense::query();
        if ($startDate && $endDate) {
            $marketingQuery->whereBetween('expense_date', [$startDate->toDateString(), $endDate->toDateString()]);
        } elseif ($startDate) {
            $marketingQuery->where('expense_date', '>=', $startDate->toDateString());
        } elseif ($endDate) {
            $marketingQuery->where('expense_date', '<=', $endDate->toDateString());
        }

        $periodMarketingCost = (float) $marketingQuery->sum('amount');
        $periodExpenses = (clone $marketingQuery)->latest('expense_date')->take(20)->get();

        $periodGrossProfit = max(0, $periodDeliveredRevenue - $periodCogs);
        $periodNetProfit = $periodGrossProfit - $periodMarketingCost;

        $analytics = [
            'period' => $period,
            'start_date' => $startDate ? $startDate->format('Y-m-d') : '',
            'end_date' => $endDate ? $endDate->format('Y-m-d') : '',
            'total_orders' => $periodTotalOrders,
            'pending_orders' => $periodPendingOrders,
            'confirmed_orders' => $periodConfirmedOrders,
            'delivered_orders' => $periodDeliveredOrders,
            'revenue' => round($periodDeliveredRevenue, 2),
            'cogs' => round($periodCogs, 2),
            'gross_profit' => round($periodGrossProfit, 2),
            'marketing_cost' => round($periodMarketingCost, 2),
            'net_profit' => round($periodNetProfit, 2),
            'expenses' => $periodExpenses,
        ];

        // 3. Recent 10 Orders
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
            'analytics' => $analytics,
            'recentOrders' => $recentOrders,
        ]);
    }

    public function storeMarketingExpense(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'expense_date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'title' => 'nullable|string|max:150',
            'notes' => 'nullable|string|max:500',
        ]);

        MarketingExpense::create($validated);

        return back()->with('success', 'মার্কেটিং খরচ সফলভাবে যুক্ত করা হয়েছে।');
    }

    public function destroyMarketingExpense(MarketingExpense $marketingExpense): RedirectResponse
    {
        $marketingExpense->delete();

        return back()->with('success', 'মার্কেটিং খরচ রেকর্ড মুছে ফেলা হয়েছে।');
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
