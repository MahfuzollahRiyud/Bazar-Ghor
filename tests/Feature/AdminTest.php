<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create([
            'email' => 'admin@bazarghor.com',
            'role' => 'admin',
        ]);
    }

    public function test_admin_can_view_products_list()
    {
        $this->actingAs($this->admin)
            ->get(route('dashboard.products.index'))
            ->assertOk();
    }

    public function test_admin_can_view_categories_list()
    {
        $this->actingAs($this->admin)
            ->get(route('dashboard.categories.index'))
            ->assertOk();
    }

    public function test_admin_can_view_orders_list()
    {
        $this->actingAs($this->admin)
            ->get(route('dashboard.orders.index'))
            ->assertOk();
    }

    public function test_admin_can_view_coupons_list()
    {
        $this->actingAs($this->admin)
            ->get(route('dashboard.coupons.index'))
            ->assertOk();
    }

    public function test_admin_can_view_customers_list()
    {
        User::factory()->create(['role' => 'customer']);

        $this->actingAs($this->admin)
            ->get(route('dashboard.customers.index'))
            ->assertOk();
    }

    public function test_admin_can_create_category()
    {
        $response = $this->actingAs($this->admin)
            ->post(route('dashboard.categories.store'), [
                'name' => 'নতুন গ্যাজেট',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('categories', [
            'name' => 'নতুন গ্যাজেট',
        ]);
    }

    public function test_admin_can_update_order_status()
    {
        $order = Order::create([
            'order_number' => 'ORD-1001',
            'customer_name' => 'Customer A',
            'customer_phone' => '01700000000',
            'division' => 'ঢাকা',
            'district' => 'ঢাকা',
            'address' => 'Banani, Dhaka',
            'delivery_area' => 'inside_dhaka',
            'delivery_charge' => 60,
            'subtotal' => 1000,
            'total' => 1060,
            'status' => 'pending',
            'payment_method' => 'cash_on_delivery',
        ]);

        $response = $this->actingAs($this->admin)
            ->patch(route('dashboard.orders.status', $order), [
                'status' => 'confirmed',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_admin_can_view_media_library()
    {
        $this->actingAs($this->admin)
            ->get(route('dashboard.media.index'))
            ->assertOk();
    }

    public function test_admin_can_query_media_api_list()
    {
        $this->actingAs($this->admin)
            ->getJson(route('dashboard.media.list'))
            ->assertOk()
            ->assertJsonStructure(['data', 'current_page']);
    }

    public function test_admin_can_create_product_with_video()
    {
        $category = Category::create(['name' => 'হেডফোন', 'slug' => 'headphone', 'is_active' => true]);

        $response = $this->actingAs($this->admin)
            ->post(route('dashboard.products.store'), [
                'name' => 'ওয়্যারলেস ব্লুটুথ হেডফোন',
                'category_id' => $category->id,
                'price' => 1200,
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'has_variants' => false,
                'is_active' => true,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('products', [
            'name' => 'ওয়্যারলেস ব্লুটুথ হেডফোন',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        ]);
    }

    public function test_admin_can_filter_orders_by_payment_method()
    {
        Order::create([
            'order_number' => 'ORD-COD-1',
            'customer_name' => 'Cash Customer',
            'customer_phone' => '01711111111',
            'division' => 'ঢাকা',
            'district' => 'ঢাকা',
            'address' => 'Dhaka',
            'delivery_area' => 'inside_dhaka',
            'delivery_charge' => 60,
            'subtotal' => 1000,
            'total' => 1060,
            'status' => 'pending',
            'payment_method' => 'cash_on_delivery',
        ]);

        Order::create([
            'order_number' => 'ORD-ONLINE-1',
            'customer_name' => 'Online Customer',
            'customer_phone' => '01822222222',
            'division' => 'ঢাকা',
            'district' => 'ঢাকা',
            'address' => 'Dhaka',
            'delivery_area' => 'inside_dhaka',
            'delivery_charge' => 60,
            'subtotal' => 2000,
            'total' => 2060,
            'status' => 'confirmed',
            'payment_method' => 'uddoktapay',
            'payment_status' => 'paid',
        ]);

        $responseCod = $this->actingAs($this->admin)
            ->get(route('dashboard.orders.index', ['payment_method' => 'cash_on_delivery']));
        $responseCod->assertOk();

        $responseOnline = $this->actingAs($this->admin)
            ->get(route('dashboard.orders.index', ['payment_method' => 'online']));
        $responseOnline->assertOk();
    }

    public function test_admin_can_bulk_delete_orders()
    {
        $order1 = Order::create([
            'order_number' => 'ORD-DEL-1',
            'customer_name' => 'Test 1',
            'customer_phone' => '01911111111',
            'division' => 'ঢাকা',
            'district' => 'ঢাকা',
            'address' => 'Dhaka',
            'delivery_area' => 'inside_dhaka',
            'delivery_charge' => 60,
            'subtotal' => 500,
            'total' => 560,
            'status' => 'pending',
        ]);

        $order2 = Order::create([
            'order_number' => 'ORD-DEL-2',
            'customer_name' => 'Test 2',
            'customer_phone' => '01922222222',
            'division' => 'ঢাকা',
            'district' => 'ঢাকা',
            'address' => 'Dhaka',
            'delivery_area' => 'inside_dhaka',
            'delivery_charge' => 60,
            'subtotal' => 600,
            'total' => 660,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('dashboard.orders.bulk-delete'), [
                'order_ids' => [$order1->id, $order2->id],
            ]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('orders', ['id' => $order1->id]);
        $this->assertDatabaseMissing('orders', ['id' => $order2->id]);
    }
}

