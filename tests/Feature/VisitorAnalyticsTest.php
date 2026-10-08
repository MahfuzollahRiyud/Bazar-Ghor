<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\VisitorLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VisitorAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_visitor_page_view_can_be_logged(): void
    {
        $response = $this->postJson('/api/analytics/log', [
            'page_path' => '/shop',
            'page_title' => 'Shop All Products — Bazar Ghor',
            'visitor_id' => 'v_test123456',
            'session_id' => 's_test123456',
            'referer' => 'https://facebook.com',
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['status', 'log_id']);

        $this->assertDatabaseHas('visitor_logs', [
            'page_path' => '/shop',
            'visitor_id' => 'v_test123456',
            'session_id' => 's_test123456',
        ]);
    }

    public function test_visitor_heartbeat_updates_duration(): void
    {
        $log = VisitorLog::create([
            'visitor_id' => 'v_heartbeat',
            'session_id' => 's_heartbeat',
            'page_path' => '/product/smart-watch',
            'page_title' => 'Smart Watch',
            'device_type' => 'mobile',
            'duration_seconds' => 5,
        ]);

        $response = $this->postJson('/api/analytics/heartbeat', [
            'log_id' => $log->id,
            'duration_seconds' => 45,
        ]);

        $response->assertOk();
        $this->assertEquals(45, $log->fresh()->duration_seconds);
    }

    public function test_admin_can_access_visitor_analytics_dashboard(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        VisitorLog::create([
            'visitor_id' => 'v_dash',
            'session_id' => 's_dash',
            'page_path' => '/',
            'page_title' => 'Home',
            'device_type' => 'desktop',
            'duration_seconds' => 30,
        ]);

        $response = $this->actingAs($admin)->get('/dashboard/analytics');
        $response->assertOk();
    }
}
