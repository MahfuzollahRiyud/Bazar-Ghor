<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('checkout', [
            'currentUser' => $user ? [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'division' => $user->division,
                'district' => $user->district,
                'upazila' => $user->upazila,
                'address' => $user->address,
            ] : null,
        ]);
    }

    public function applyCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (!$coupon || !$coupon->isValid()) {
            return response()->json(['message' => 'এই কুপন কোডটি বৈধ নয়।'], 422);
        }

        if ($request->subtotal < $coupon->min_order_amount) {
            return response()->json([
                'message' => "এই কুপন ব্যবহার করতে ন্যূনতম ৳" . number_format($coupon->min_order_amount, 0) . " অর্ডার করতে হবে।",
            ], 422);
        }

        $discount = $coupon->calculateDiscount($request->subtotal);

        return response()->json([
            'coupon' => [
                'code' => $coupon->code,
                'discount_type' => $coupon->discount_type,
                'discount_value' => $coupon->discount_value,
            ],
            'discount' => $discount,
            'message' => 'কুপন সফলভাবে প্রয়োগ হয়েছে! ৳' . number_format($discount, 0) . ' ছাড় পেয়েছেন।',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $rules = [
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'division' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'upazila' => 'nullable|string|max:100',
            'address' => 'required|string|max:500',
            'delivery_area' => 'required|in:inside_dhaka,outside_dhaka',
            'notes' => 'nullable|string|max:500',
            'coupon_code' => 'nullable|string|max:50',
            'create_account' => 'nullable|boolean',
            'password' => 'nullable|string|min:6',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
        ];

        if ($request->boolean('create_account') && !Auth::check()) {
            $rules['customer_email'] = 'required|email|max:255|unique:users,email';
            $rules['password'] = 'required|string|min:6';
        }

        $request->validate($rules);

        DB::beginTransaction();
        try {
            $userId = null;

            if (Auth::check()) {
                $userId = Auth::id();
                // Optionally update address fields if missing
                $currentUser = Auth::user();
                $updateData = [];
                if (!$currentUser->phone && $request->customer_phone) $updateData['phone'] = $request->customer_phone;
                if (!$currentUser->division && $request->division) $updateData['division'] = $request->division;
                if (!$currentUser->district && $request->district) $updateData['district'] = $request->district;
                if (!$currentUser->upazila && $request->upazila) $updateData['upazila'] = $request->upazila;
                if (!$currentUser->address && $request->address) $updateData['address'] = $request->address;
                if (!empty($updateData)) {
                    $currentUser->update($updateData);
                }
            } elseif ($request->boolean('create_account')) {
                $newUser = User::create([
                    'name' => $request->customer_name,
                    'email' => $request->customer_email,
                    'password' => Hash::make($request->password),
                    'phone' => $request->customer_phone,
                    'division' => $request->division,
                    'district' => $request->district,
                    'upazila' => $request->upazila,
                    'address' => $request->address,
                    'role' => 'customer',
                ]);
                Auth::login($newUser);
                $userId = $newUser->id;
            }

            $deliveryCharge = $request->delivery_area === 'inside_dhaka' ? 60 : 120;
            $subtotal = 0;
            $orderItems = [];

            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $variant = isset($item['variant_id']) && $item['variant_id'] ? ProductVariant::find($item['variant_id']) : null;

                $price = $variant ? $variant->effective_price : $product->effective_price;
                $total = $price * $item['quantity'];
                $subtotal += $total;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'product_name' => $product->name,
                    'variant_name' => $variant?->name,
                    'thumbnail' => $product->thumbnail_url,
                    'price' => $price,
                    'quantity' => $item['quantity'],
                    'total' => $total,
                ];
            }

            // Apply coupon
            $discount = 0;
            $couponCode = null;
            if ($request->filled('coupon_code')) {
                $coupon = Coupon::where('code', strtoupper($request->coupon_code))->first();
                if ($coupon && $coupon->isValid() && $subtotal >= $coupon->min_order_amount) {
                    $discount = $coupon->calculateDiscount($subtotal);
                    $couponCode = $coupon->code;
                    $coupon->increment('used_count');
                }
            }

            $total = $subtotal + $deliveryCharge - $discount;

            $order = Order::create([
                'user_id' => $userId,
                'order_number' => Order::generateOrderNumber(),
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'customer_email' => $request->customer_email,
                'division' => $request->division,
                'district' => $request->district,
                'upazila' => $request->upazila,
                'address' => $request->address,
                'delivery_area' => $request->delivery_area,
                'delivery_charge' => $deliveryCharge,
                'subtotal' => $subtotal,
                'coupon_code' => $couponCode,
                'discount' => $discount,
                'total' => $total,
                'status' => 'pending',
                'payment_method' => 'cash_on_delivery',
                'notes' => $request->notes,
            ]);

            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            DB::commit();

            return redirect()->route('order.success', $order->id);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['general' => 'অর্ডার দেওয়ায় সমস্যা হয়েছে। আবার চেষ্টা করুন।']);
        }
    }

    public function success(Order $order): Response
    {
        return Inertia::render('order-success', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'total' => $order->total,
                'delivery_area' => $order->delivery_area,
                'delivery_charge' => $order->delivery_charge,
                'status' => $order->status,
                'created_at' => $order->created_at->format('d M Y, h:i A'),
                'items' => $order->items->map(fn($i) => [
                    'product_name' => $i->product_name,
                    'variant_name' => $i->variant_name,
                    'price' => $i->price,
                    'quantity' => $i->quantity,
                    'total' => $i->total,
                    'thumbnail' => $i->thumbnail,
                ]),
            ],
        ]);
    }
}
