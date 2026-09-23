<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StorefrontTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_loads_successfully()
    {
        $response = $this->get('/');
        $response->assertOk();
    }

    public function test_shop_page_loads_successfully()
    {
        $category = Category::create(['name' => 'Fashion', 'slug' => 'fashion']);
        Product::create([
            'category_id' => $category->id,
            'name' => 'Classic Polo',
            'slug' => 'classic-polo',
            'price' => 1200,
            'thumbnail' => 'products/polo.jpg',
            'images' => ['products/polo-side.jpg', 'products/polo-back.jpg'],
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'is_active' => true,
            'stock_quantity' => 5,
        ]);

        $response = $this->get('/shop');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('shop')
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Classic Polo')
            ->where('products.data.0.video_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            ->has('products.data.0.gallery_urls', 3)
        );
    }

    public function test_product_detail_page_loads_successfully()
    {
        $category = Category::create(['name' => 'Gadgets', 'slug' => 'gadgets']);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Smart Watch Pro',
            'slug' => 'smart-watch-pro',
            'price' => 2500,
            'video_url' => 'https://www.youtube.com/watch?v=pcKuH',
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        $response = $this->get('/product/smart-watch-pro');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('product-detail')
            ->where('product.video_url', 'https://www.youtube.com/watch?v=pcKuH')
        );
    }

    public function test_cart_and_static_pages_load_successfully()
    {
        $this->get('/cart')->assertOk();
        $this->get('/about')->assertOk();
        $this->get('/contact')->assertOk();
        $this->get('/privacy-policy')->assertOk();
        $this->get('/return-policy')->assertOk();
        $this->get('/terms')->assertOk();
        $this->get('/checkout')->assertOk();
    }

    public function test_checkout_places_cash_on_delivery_order_successfully()
    {
        $category = Category::create(['name' => 'Gadgets', 'slug' => 'gadgets']);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'TWS Earbuds',
            'slug' => 'tws-earbuds',
            'price' => 1000,
            'stock_quantity' => 20,
            'is_active' => true,
        ]);

        $orderData = [
            'customer_name' => 'Rahim Uddin',
            'customer_phone' => '01711111111',
            'customer_email' => 'rahim@example.com',
            'division' => 'ঢাকা',
            'district' => 'ঢাকা',
            'upazila' => 'মিরপুর',
            'address' => 'Mirpur 10, Dhaka',
            'delivery_area' => 'inside_dhaka',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                ],
            ],
        ];

        $response = $this->post('/checkout', $orderData);
        $response->assertRedirect();

        $this->assertDatabaseHas('orders', [
            'customer_name' => 'Rahim Uddin',
            'customer_phone' => '01711111111',
            'delivery_area' => 'inside_dhaka',
            'delivery_charge' => 60,
            'subtotal' => 2000,
            'total' => 2060,
            'payment_method' => 'cash_on_delivery',
        ]);
    }

    public function test_coupon_can_be_applied_and_calculated()
    {
        Coupon::create([
            'code' => 'DISCOUNT50',
            'discount_type' => 'fixed',
            'discount_value' => 50,
            'min_order_amount' => 500,
            'is_active' => true,
        ]);

        $response = $this->postJson('/checkout/apply-coupon', [
            'code' => 'DISCOUNT50',
            'subtotal' => 1000,
        ]);

        $response->assertOk();
        $response->assertJson([
            'coupon' => ['code' => 'DISCOUNT50'],
            'discount' => 50,
        ]);
    }
}
