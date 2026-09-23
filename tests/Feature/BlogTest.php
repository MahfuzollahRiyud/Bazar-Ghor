<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BlogTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_blog_index_page(): void
    {
        BlogPost::create([
            'title' => 'Test Blog Post',
            'slug' => 'test-blog-post',
            'content' => '<p>Test content</p>',
            'is_published' => true,
            'published_at' => now()->subDay(),
        ]);

        $response = $this->get(route('blog.index'));

        $response->assertStatus(200);
    }

    public function test_guest_can_view_single_blog_post(): void
    {
        $post = BlogPost::create([
            'title' => 'Gadget Buying Guide',
            'slug' => 'gadget-buying-guide',
            'content' => '<p>This is test content.</p>',
            'is_published' => true,
            'published_at' => now()->subDay(),
            'views_count' => 0,
        ]);

        $response = $this->get(route('blog.show', $post->slug));

        $response->assertStatus(200);
        $this->assertEquals(1, $post->fresh()->views_count);
    }

    public function test_guest_cannot_access_dashboard_blogs(): void
    {
        $response = $this->get(route('dashboard.blogs.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_access_dashboard_blogs(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get(route('dashboard.blogs.index'));
        $response->assertStatus(200);
    }

    public function test_admin_can_create_blog_post(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('dashboard.blogs.store'), [
            'title' => 'New Airbuds Review',
            'slug' => 'new-airbuds-review',
            'category' => 'Airbuds',
            'excerpt' => 'A short summary',
            'content' => '<p>Full detailed review here.</p>',
            'is_published' => '1',
            'tags' => 'airbuds, gadgets',
        ]);

        $response->assertRedirect(route('dashboard.blogs.index'));
        $this->assertDatabaseHas('blog_posts', [
            'title' => 'New Airbuds Review',
            'slug' => 'new-airbuds-review',
            'is_published' => true,
        ]);
    }

    public function test_admin_can_update_blog_post(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $post = BlogPost::create([
            'title' => 'Old Title',
            'slug' => 'old-title',
            'content' => 'Old content',
            'is_published' => true,
        ]);

        $response = $this->actingAs($admin)->post(route('dashboard.blogs.update', $post->id), [
            'title' => 'Updated Title',
            'slug' => 'updated-title',
            'content' => 'Updated content',
            'is_published' => '1',
        ]);

        $response->assertRedirect(route('dashboard.blogs.index'));
        $this->assertDatabaseHas('blog_posts', [
            'id' => $post->id,
            'title' => 'Updated Title',
            'slug' => 'updated-title',
        ]);
    }

    public function test_admin_can_toggle_blog_post_publish_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $post = BlogPost::create([
            'title' => 'Draft Post',
            'slug' => 'draft-post',
            'content' => 'Content',
            'is_published' => false,
        ]);

        $response = $this->actingAs($admin)->patch(route('dashboard.blogs.toggle', $post->id));
        $response->assertStatus(302);

        $this->assertTrue($post->fresh()->is_published);
    }

    public function test_admin_can_delete_blog_post(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $post = BlogPost::create([
            'title' => 'To be deleted',
            'slug' => 'to-be-deleted',
            'content' => 'Content',
            'is_published' => true,
        ]);

        $response = $this->actingAs($admin)->delete(route('dashboard.blogs.destroy', $post->id));
        $response->assertRedirect(route('dashboard.blogs.index'));

        $this->assertDatabaseMissing('blog_posts', [
            'id' => $post->id,
        ]);
    }
}
