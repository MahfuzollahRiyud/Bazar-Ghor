<?php

namespace Tests\Feature;

use App\Models\SocialLink;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SocialLinkTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'email' => 'admin@bazarghor.com',
            'role' => 'admin',
        ]);

        $this->customer = User::factory()->create([
            'email' => 'customer@bazarghor.com',
            'role' => 'customer',
        ]);
    }

    public function test_admin_can_view_social_links_index(): void
    {
        $this->actingAs($this->admin)
            ->get(route('dashboard.social-links.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('dashboard/social-links/index'));
    }

    public function test_non_admin_cannot_view_social_links_index(): void
    {
        $this->actingAs($this->customer)
            ->get(route('dashboard.social-links.index'))
            ->assertRedirect(route('account.index'));
    }

    public function test_admin_can_create_social_link(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('dashboard.social-links.store'), [
                'platform' => 'instagram',
                'title' => 'Instagram Profile',
                'url' => 'https://www.instagram.com/bazarghor',
                'icon' => 'instagram',
                'color' => '#E4405F',
                'is_active' => true,
                'show_in_header' => true,
                'show_in_footer' => true,
                'sort_order' => 2,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('social_links', [
            'platform' => 'instagram',
            'title' => 'Instagram Profile',
            'url' => 'https://www.instagram.com/bazarghor',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_update_social_link(): void
    {
        $link = SocialLink::create([
            'platform' => 'youtube',
            'title' => 'Old Title',
            'url' => 'https://youtube.com',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->put(route('dashboard.social-links.update', $link), [
                'platform' => 'youtube',
                'title' => 'Official YouTube Channel',
                'url' => 'https://www.youtube.com/@bazarghor',
                'is_active' => true,
                'show_in_header' => false,
                'show_in_footer' => true,
                'sort_order' => 5,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('social_links', [
            'id' => $link->id,
            'title' => 'Official YouTube Channel',
            'show_in_header' => false,
        ]);
    }

    public function test_admin_can_delete_social_link(): void
    {
        $link = SocialLink::create([
            'platform' => 'tiktok',
            'title' => 'TikTok',
            'url' => 'https://tiktok.com/@bazarghor',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('dashboard.social-links.destroy', $link));

        $response->assertRedirect();

        $this->assertDatabaseMissing('social_links', [
            'id' => $link->id,
        ]);
    }

    public function test_admin_can_toggle_social_link_visibility(): void
    {
        $link = SocialLink::create([
            'platform' => 'facebook',
            'title' => 'Facebook',
            'url' => 'https://facebook.com',
            'is_active' => true,
            'show_in_header' => true,
        ]);

        $this->actingAs($this->admin)
            ->patch(route('dashboard.social-links.toggle', $link), [
                'field' => 'show_in_header',
            ])
            ->assertRedirect();

        $this->assertFalse($link->fresh()->show_in_header);
    }

    public function test_admin_can_reorder_social_links(): void
    {
        $link1 = SocialLink::create([
            'platform' => 'facebook',
            'title' => 'FB',
            'url' => 'https://facebook.com',
            'sort_order' => 1,
        ]);

        $link2 = SocialLink::create([
            'platform' => 'instagram',
            'title' => 'IG',
            'url' => 'https://instagram.com',
            'sort_order' => 2,
        ]);

        $this->actingAs($this->admin)
            ->post(route('dashboard.social-links.reorder'), [
                'orders' => [
                    ['id' => $link1->id, 'sort_order' => 2],
                    ['id' => $link2->id, 'sort_order' => 1],
                ],
            ])
            ->assertRedirect();

        $this->assertEquals(2, $link1->fresh()->sort_order);
        $this->assertEquals(1, $link2->fresh()->sort_order);
    }

    public function test_social_links_are_shared_with_storefront_page(): void
    {
        SocialLink::create([
            'platform' => 'facebook',
            'title' => 'Facebook Page',
            'url' => 'https://facebook.com/onlinebazarghor',
            'is_active' => true,
            'show_in_header' => true,
            'show_in_footer' => true,
            'sort_order' => 1,
        ]);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('socialLinks')
                ->where('socialLinks.0.platform', 'facebook')
            );
    }
}
