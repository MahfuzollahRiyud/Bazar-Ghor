<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CustomerPortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_redirected_from_dashboard_to_account()
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $response = $this->actingAs($customer)->get('/dashboard');
        $response->assertRedirect(route('account.index'));
    }

    public function test_customer_cannot_access_admin_dashboard_routes()
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $response = $this->actingAs($customer)->get(route('dashboard.products.index'));
        $response->assertRedirect(route('account.index'));
    }

    public function test_customer_can_access_account_dashboard()
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $response = $this->actingAs($customer)->get(route('account.index'));
        $response->assertOk();
    }

    public function test_customer_can_update_profile()
    {
        $customer = User::factory()->create([
            'name' => 'Old Name',
            'role' => 'customer',
        ]);

        $response = $this->actingAs($customer)->patch(route('account.profile.update'), [
            'name' => 'Updated Name',
            'phone' => '01712345678',
            'division' => 'Dhaka',
            'district' => 'Dhaka',
            'upazila' => 'Mirpur',
            'address' => 'Section 10, Block C',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('users', [
            'id' => $customer->id,
            'name' => 'Updated Name',
            'phone' => '01712345678',
            'district' => 'Dhaka',
        ]);
    }

    public function test_customer_can_update_password()
    {
        $customer = User::factory()->create([
            'password' => Hash::make('oldpassword123'),
            'role' => 'customer',
        ]);

        $response = $this->actingAs($customer)->put(route('account.password.update'), [
            'current_password' => 'oldpassword123',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertTrue(Hash::check('newpassword123', $customer->fresh()->password));
    }

    public function test_guest_checkout_places_order_without_account()
    {
        $category = Category::create([
            'name' => 'Audio',
            'slug' => 'audio',
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'TWS Earbuds Pro',
            'slug' => 'tws-earbuds-pro',
            'price' => 1500,
            'stock' => 10,
            'is_active' => true,
        ]);

        $response = $this->post(route('checkout.store'), [
            'customer_name' => 'Guest Customer',
            'customer_phone' => '01812345678',
            'customer_email' => 'guest@example.com',
            'division' => 'Dhaka',
            'district' => 'Dhaka',
            'address' => 'Dhanmondi 32',
            'delivery_area' => 'inside_dhaka',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                ],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'customer_name' => 'Guest Customer',
            'customer_phone' => '01812345678',
            'user_id' => null,
            'delivery_charge' => 60,
        ]);
    }

    public function test_checkout_with_create_account_registers_customer_and_links_order()
    {
        $category = Category::create([
            'name' => 'Smart Watch',
            'slug' => 'smart-watch',
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Smart Watch Ultra',
            'slug' => 'smart-watch-ultra',
            'price' => 2500,
            'stock' => 10,
            'is_active' => true,
        ]);

        $response = $this->post(route('checkout.store'), [
            'customer_name' => 'New User Customer',
            'customer_phone' => '01912345678',
            'customer_email' => 'newuser@example.com',
            'password' => 'secret1234',
            'create_account' => true,
            'division' => 'Chattogram',
            'district' => 'Chattogram',
            'address' => 'GEC Circle',
            'delivery_area' => 'outside_dhaka',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                ],
            ],
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'name' => 'New User Customer',
            'role' => 'customer',
        ]);

        $user = User::where('email', 'newuser@example.com')->first();
        $this->assertNotNull($user);

        $this->assertDatabaseHas('orders', [
            'customer_name' => 'New User Customer',
            'user_id' => $user->id,
            'delivery_charge' => 120,
        ]);
    }
}
