<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\MetaCapiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MetaPixelCapiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_meta_pixel_settings_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get('/dashboard/settings/meta-pixel');

        $response->assertOk();
    }

    public function test_admin_can_update_meta_pixel_and_capi_settings(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/dashboard/settings/meta-pixel', [
            'meta_pixel_id' => '123456789012345',
            'meta_pixel_enabled' => true,
            'meta_capi_token' => 'EAAB_test_access_token_mock',
            'meta_capi_enabled' => true,
            'meta_test_event_code' => 'TEST12345',
        ]);

        $response->assertRedirect();
        $this->assertEquals('123456789012345', SiteSetting::get('meta_pixel_id'));
        $this->assertEquals('1', SiteSetting::get('meta_pixel_enabled'));
        $this->assertEquals('EAAB_test_access_token_mock', SiteSetting::get('meta_capi_token'));
        $this->assertEquals('1', SiteSetting::get('meta_capi_enabled'));
        $this->assertEquals('TEST12345', SiteSetting::get('meta_test_event_code'));
    }

    public function test_meta_capi_service_dispatches_purchase_event_with_deduplication(): void
    {
        SiteSetting::set('meta_pixel_id', '123456789012345');
        SiteSetting::set('meta_capi_token', 'mock_token_123');
        SiteSetting::set('meta_capi_enabled', '1');
        SiteSetting::set('meta_test_event_code', 'TEST999');

        Http::fake([
            'https://graph.facebook.com/v21.0/123456789012345/events' => Http::response([
                'events_received' => 1,
                'fbtrace_id' => 'trace_mock_123',
            ], 200),
        ]);

        $order = Order::create([
            'order_number' => 'BG-TEST-2026',
            'customer_name' => 'Robin Ahmed',
            'customer_phone' => '01712345678',
            'customer_email' => 'robin@example.com',
            'division' => 'Dhaka',
            'district' => 'Dhaka',
            'address' => 'Road 1, House 2, Dhanmondi',
            'delivery_area' => 'inside_dhaka',
            'delivery_charge' => 60,
            'subtotal' => 1000,
            'discount' => 0,
            'total' => 1060,
            'status' => 'pending',
            'payment_method' => 'cash_on_delivery',
            'payment_status' => 'unpaid',
        ]);

        $order->items()->create([
            'product_name' => 'Smart Watch Pro',
            'price' => 1000,
            'quantity' => 1,
            'total' => 1000,
        ]);

        $success = MetaCapiService::sendPurchaseEvent($order);

        $this->assertTrue($success);

        Http::assertSent(function ($request) use ($order) {
            $data = $request->data();
            $event = $data['data'][0] ?? [];

            return $request->hasHeader('Authorization', 'Bearer mock_token_123')
                && $event['event_name'] === 'Purchase'
                && $event['event_id'] === 'order_BG-TEST-2026'
                && $event['custom_data']['value'] == 1060
                && $event['custom_data']['currency'] === 'BDT'
                && isset($event['user_data']['ph'][0])
                && isset($event['user_data']['em'][0])
                && ($data['test_event_code'] ?? '') === 'TEST999';
        });
    }

    public function test_admin_can_send_test_event_via_api(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        SiteSetting::set('meta_pixel_id', '123456789012345');
        SiteSetting::set('meta_capi_token', 'mock_token_123');

        Http::fake([
            'https://graph.facebook.com/v21.0/123456789012345/events' => Http::response([
                'events_received' => 1,
                'fbtrace_id' => 'trace_mock_test',
            ], 200),
        ]);

        $response = $this->actingAs($admin)->postJson('/dashboard/settings/meta-pixel/test', [
            'test_event_code' => 'TEST999',
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
        ]);
    }
}
