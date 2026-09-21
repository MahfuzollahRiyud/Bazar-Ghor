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
}
