<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $query = User::where('role', 'customer')
            ->withCount('orders')
            ->withSum(['orders as total_spent' => function ($q) {
                $q->where('status', '!=', 'cancelled');
            }], 'total');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%");
            });
        }

        $customers = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                    'division' => $customer->division,
                    'district' => $customer->district,
                    'upazila' => $customer->upazila,
                    'address' => $customer->address,
                    'orders_count' => $customer->orders_count,
                    'total_spent' => (float) ($customer->total_spent ?? 0),
                    'created_at' => $customer->created_at?->format('d M Y, h:i A'),
                    'joined_date' => $customer->created_at?->format('d M Y'),
                ];
            });

        $stats = [
            'total_customers' => User::where('role', 'customer')->count(),
            'active_buyers' => User::where('role', 'customer')->has('orders')->count(),
            'total_customer_revenue' => (float) \App\Models\Order::whereNotNull('user_id')->where('status', '!=', 'cancelled')->sum('total'),
        ];

        return Inertia::render('dashboard/customers/index', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
            ],
            'stats' => $stats,
        ]);
    }
}
