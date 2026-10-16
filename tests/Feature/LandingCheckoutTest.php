<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingCheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create([
            'role' => 'admin',
        ]);
        $this->category = Category::create([
            'name' => 'General',
            'slug' => 'general',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_toggle_show_direct_checkout_on_product()
    {
        $this->actingAs($this->admin);

        $response = $this->post(route('dashboard.products.store'), [
            'name' => 'Landing Page Honey',
            'category_ids' => [$this->category->id],
            'price' => 500,
            'show_direct_checkout' => true,
            'is_active' => true,
        ]);

        $response->assertRedirect(route('dashboard.products.index'));

        $product = Product::where('name', 'Landing Page Honey')->first();
        $this->assertNotNull($product);
        $this->assertTrue((bool) $product->show_direct_checkout);

        // Edit and turn off
        $updateResponse = $this->post(route('dashboard.products.update', $product->id), [
            '_method' => 'POST',
            'name' => 'Landing Page Honey',
            'category_ids' => [$this->category->id],
            'price' => 500,
            'show_direct_checkout' => false,
            'is_active' => true,
        ]);

        $updateResponse->assertRedirect(route('dashboard.products.index'));
        $product->refresh();
        $this->assertFalse((bool) $product->show_direct_checkout);
    }

    public function test_customer_can_place_order_from_landing_checkout_without_division_district_dropdowns()
    {
        $product = Product::create([
            'name' => 'Organic Pure Ghee',
            'slug' => 'organic-pure-ghee',
            'category_id' => $this->category->id,
            'price' => 850,
            'stock_quantity' => 20,
            'is_active' => true,
            'show_direct_checkout' => true,
        ]);

        $response = $this->post('/checkout', [
            'customer_name' => 'Rahim Uddin',
            'customer_phone' => '01712345678',
            'address' => 'House 12, Road 4, Sector 7, Uttara, Dhaka',
            'delivery_area' => 'inside_dhaka',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                ],
            ],
        ]);

        $this->assertDatabaseHas('orders', [
            'customer_name' => 'Rahim Uddin',
            'customer_phone' => '01712345678',
            'delivery_area' => 'inside_dhaka',
            'division' => 'ঢাকা',
            'district' => 'ঢাকা',
            'subtotal' => 1700,
        ]);
    }
}
