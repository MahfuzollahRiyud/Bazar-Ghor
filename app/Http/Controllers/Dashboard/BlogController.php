<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    /**
     * Display a listing of the blog posts.
     */
    public function index(Request $request): Response
    {
        $query = BlogPost::query()->latest('id');

        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        if ($request->filled('status')) {
            if ($request->input('status') === 'published') {
                $query->where('is_published', true);
            } elseif ($request->input('status') === 'draft') {
                $query->where('is_published', false);
            }
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        $posts = $query->paginate(12)->withQueryString();

        $categories = BlogPost::whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('dashboard/blogs/index', [
            'posts' => $posts,
            'categories' => $categories,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', ''),
                'category' => $request->input('category', ''),
            ],
        ]);
    }

    /**
     * Show the form for creating a new blog post.
     */
    public function create(): Response
    {
        $existingCategories = BlogPost::whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('dashboard/blogs/create', [
            'existingCategories' => $existingCategories,
        ]);
    }

    /**
     * Store a newly created blog post.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_posts,slug',
            'category' => 'nullable|string|max:100',
            'featured_image' => 'nullable|string|max:500',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:10240',
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'author_name' => 'nullable|string|max:100',
            'is_published' => 'nullable|boolean',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'tags' => 'nullable',
        ]);

        $featuredImage = $validated['featured_image'] ?? null;

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = 'blog_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $featuredImage = $file->storeAs('blog', $filename, 'public');
        }

        $slug = !empty($validated['slug'])
            ? BlogPost::generateUniqueSlug($validated['slug'])
            : BlogPost::generateUniqueSlug($validated['title']);

        $tags = [];
        if (!empty($validated['tags'])) {
            if (is_array($validated['tags'])) {
                $tags = $validated['tags'];
            } else {
                $tags = array_map('trim', explode(',', (string) $validated['tags']));
            }
        }

        $isPublished = $request->boolean('is_published', true);
        $publishedAt = $validated['published_at'] ?? ($isPublished ? now() : null);

        BlogPost::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'category' => $validated['category'] ?? null,
            'featured_image' => $featuredImage,
            'excerpt' => $validated['excerpt'] ?? null,
            'content' => $validated['content'],
            'author_id' => $request->user()?->id,
            'author_name' => !empty($validated['author_name']) ? $validated['author_name'] : ($request->user()?->name ?? 'Bazar Ghor'),
            'is_published' => $isPublished,
            'published_at' => $publishedAt,
            'meta_title' => $validated['meta_title'] ?? $validated['title'],
            'meta_description' => $validated['meta_description'] ?? ($validated['excerpt'] ?? null),
            'tags' => $tags,
        ]);

        return redirect()->route('dashboard.blogs.index')->with('success', 'Blog post created successfully.');
    }

    /**
     * Show the form for editing the specified blog post.
     */
    public function edit(BlogPost $blog): Response
    {
        $existingCategories = BlogPost::whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('dashboard/blogs/edit', [
            'post' => $blog,
            'existingCategories' => $existingCategories,
        ]);
    }

    /**
     * Update the specified blog post.
     */
    public function update(Request $request, BlogPost $blog): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_posts,slug,' . $blog->id,
            'category' => 'nullable|string|max:100',
            'featured_image' => 'nullable|string|max:500',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:10240',
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'author_name' => 'nullable|string|max:100',
            'is_published' => 'nullable|boolean',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'tags' => 'nullable',
        ]);

        $featuredImage = $validated['featured_image'] ?? $blog->featured_image;

        if ($request->hasFile('image')) {
            // Delete old file if stored locally in storage/blog
            if ($blog->featured_image && Storage::disk('public')->exists($blog->featured_image)) {
                Storage::disk('public')->delete($blog->featured_image);
            }
            $file = $request->file('image');
            $filename = 'blog_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $featuredImage = $file->storeAs('blog', $filename, 'public');
        }

        $slug = !empty($validated['slug'])
            ? BlogPost::generateUniqueSlug($validated['slug'], $blog->id)
            : BlogPost::generateUniqueSlug($validated['title'], $blog->id);

        $tags = [];
        if (!empty($validated['tags'])) {
            if (is_array($validated['tags'])) {
                $tags = $validated['tags'];
            } else {
                $tags = array_map('trim', explode(',', (string) $validated['tags']));
            }
        }

        $isPublished = $request->boolean('is_published', $blog->is_published);
        $publishedAt = $validated['published_at'] ?? ($isPublished && !$blog->published_at ? now() : $blog->published_at);

        $blog->update([
            'title' => $validated['title'],
            'slug' => $slug,
            'category' => $validated['category'] ?? $blog->category,
            'featured_image' => $featuredImage,
            'excerpt' => $validated['excerpt'] ?? $blog->excerpt,
            'content' => $validated['content'],
            'author_name' => !empty($validated['author_name']) ? $validated['author_name'] : $blog->author_name,
            'is_published' => $isPublished,
            'published_at' => $publishedAt,
            'meta_title' => $validated['meta_title'] ?? $blog->meta_title ?? $validated['title'],
            'meta_description' => $validated['meta_description'] ?? $blog->meta_description ?? ($validated['excerpt'] ?? null),
            'tags' => $tags,
        ]);

        return redirect()->route('dashboard.blogs.index')->with('success', 'Blog post updated successfully.');
    }

    /**
     * Remove the specified blog post.
     */
    public function destroy(BlogPost $blog): RedirectResponse
    {
        if ($blog->featured_image && Storage::disk('public')->exists($blog->featured_image)) {
            Storage::disk('public')->delete($blog->featured_image);
        }

        $blog->delete();

        return redirect()->route('dashboard.blogs.index')->with('success', 'Blog post deleted successfully.');
    }

    /**
     * Toggle the published status.
     */
    public function toggle(BlogPost $blog): RedirectResponse
    {
        $newStatus = !$blog->is_published;
        $blog->update([
            'is_published' => $newStatus,
            'published_at' => $newStatus && !$blog->published_at ? now() : $blog->published_at,
        ]);

        return back()->with('success', 'Blog post status updated.');
    }
}
