<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    /**
     * Display a listing of published blog posts.
     */
    public function index(Request $request): Response
    {
        $query = BlogPost::published()->latest('published_at');

        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        $posts = $query->paginate(9)->withQueryString();

        $categories = BlogPost::published()
            ->whereNotNull('category')
            ->selectRaw('category, count(*) as count')
            ->groupBy('category')
            ->orderBy('count', 'desc')
            ->get();

        $featuredPost = null;
        if (!$request->filled('search') && !$request->filled('category') && $posts->currentPage() === 1) {
            $featuredPost = BlogPost::published()
                ->orderBy('views_count', 'desc')
                ->latest('published_at')
                ->first();
        }

        return Inertia::render('blog/index', [
            'posts' => $posts,
            'categories' => $categories,
            'featuredPost' => $featuredPost,
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', ''),
            ],
        ]);
    }

    /**
     * Display the specified blog post.
     */
    public function show(string $slug): Response
    {
        $post = BlogPost::published()
            ->where('slug', $slug)
            ->firstOrFail();

        // Increment views count silently without triggering timestamps
        $post->timestamps = false;
        $post->increment('views_count');
        $post->timestamps = true;

        $recentPosts = BlogPost::published()
            ->where('id', '!=', $post->id)
            ->latest('published_at')
            ->take(4)
            ->get();

        // Recommended gadget products for customer cross-sell
        $recommendedProducts = Product::where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->orderBy('is_featured', 'desc')
            ->latest('id')
            ->take(4)
            ->get();

        return Inertia::render('blog/show', [
            'post' => $post,
            'recentPosts' => $recentPosts,
            'recommendedProducts' => $recommendedProducts,
        ]);
    }
}
