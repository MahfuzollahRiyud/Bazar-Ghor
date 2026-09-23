<?php

namespace Tests\Feature;

use App\Models\CodeSnippet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CodeSnippetTest extends TestCase
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

    public function test_admin_can_view_snippets_page(): void
    {
        $this->actingAs($this->admin)
            ->get(route('dashboard.snippets.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('dashboard/snippets/index'));
    }

    public function test_admin_can_create_code_snippets(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('dashboard.snippets.store'), [
                'title' => 'Meta Pixel Base Code',
                'location' => 'header',
                'code' => '<script>console.log("fbq init");</script>',
                'is_active' => true,
                'sort_order' => 1,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('code_snippets', [
            'title' => 'Meta Pixel Base Code',
            'location' => 'header',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_update_code_snippet(): void
    {
        $snippet = CodeSnippet::create([
            'title' => 'Old Title',
            'location' => 'body',
            'code' => '<noscript>GTM</noscript>',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->put(route('dashboard.snippets.update', $snippet), [
                'title' => 'Updated GTM Body',
                'location' => 'body',
                'code' => '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX"></iframe></noscript>',
                'is_active' => true,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('code_snippets', [
            'id' => $snippet->id,
            'title' => 'Updated GTM Body',
        ]);
    }

    public function test_admin_can_toggle_snippet_status(): void
    {
        $snippet = CodeSnippet::create([
            'title' => 'Chat Widget',
            'location' => 'footer',
            'code' => '<script>window.liveChat = true;</script>',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->patch(route('dashboard.snippets.toggle', $snippet));

        $response->assertRedirect();

        $this->assertDatabaseHas('code_snippets', [
            'id' => $snippet->id,
            'is_active' => false,
        ]);
    }

    public function test_admin_can_delete_code_snippet(): void
    {
        $snippet = CodeSnippet::create([
            'title' => 'Temporary Promo',
            'location' => 'header',
            'code' => '<meta name="promo" content="sale">',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('dashboard.snippets.destroy', $snippet));

        $response->assertRedirect();

        $this->assertDatabaseMissing('code_snippets', [
            'id' => $snippet->id,
        ]);
    }

    public function test_active_snippets_are_rendered_on_storefront_pages(): void
    {
        CodeSnippet::create([
            'title' => 'FB Pixel',
            'location' => 'header',
            'code' => '<script id="fb-pixel-test">console.log("FB loaded");</script>',
            'is_active' => true,
        ]);

        CodeSnippet::create([
            'title' => 'GTM NoScript Body',
            'location' => 'body',
            'code' => '<div id="gtm-body-test">GTM BODY</div>',
            'is_active' => true,
        ]);

        CodeSnippet::create([
            'title' => 'Live Chat Footer',
            'location' => 'footer',
            'code' => '<script id="chat-footer-test">console.log("Chat loaded");</script>',
            'is_active' => true,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertSee('<script id="fb-pixel-test">console.log("FB loaded");</script>', false);
        $response->assertSee('<div id="gtm-body-test">GTM BODY</div>', false);
        $response->assertSee('<script id="chat-footer-test">console.log("Chat loaded");</script>', false);
    }

    public function test_inactive_snippets_are_not_rendered_on_storefront(): void
    {
        CodeSnippet::create([
            'title' => 'Inactive Tracker',
            'location' => 'header',
            'code' => '<script id="inactive-script-test">shouldNotAppear();</script>',
            'is_active' => false,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertDontSee('<script id="inactive-script-test">shouldNotAppear();</script>', false);
    }

    public function test_snippets_are_not_rendered_on_dashboard_pages(): void
    {
        CodeSnippet::create([
            'title' => 'Storefront Only Script',
            'location' => 'header',
            'code' => '<script id="storefront-only-marker">storefrontOnly();</script>',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->get(route('dashboard.products.index'));

        $response->assertOk();
        $response->assertDontSee('<script id="storefront-only-marker">storefrontOnly();</script>', false);
    }
}
