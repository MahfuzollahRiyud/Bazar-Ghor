<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $categories = Category::where('is_active', true)
            ->orderBy('sort_order')
            ->withCount(['products' => fn($q) => $q->where('is_active', true)])
            ->get()
            ->map(fn($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'image_url' => $cat->image_url,
                'products_count' => $cat->products_count,
            ]);

        $featuredProducts = Product::with('category')
            ->where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('sort_order')
            ->take(8)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));

        $newArrivals = Product::with('category')
            ->where('is_active', true)
            ->latest()
            ->take(4)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));

        $heroMode = \App\Models\SiteSetting::get('hero_mode', 'single');
        $heroSlides = \App\Models\HeroSlide::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->get()
            ->map(fn($slide) => [
                'id' => $slide->id,
                'title' => $slide->title,
                'subtitle' => $slide->subtitle,
                'link_url' => $slide->link_url,
                'image_url' => $slide->image_url,
            ]);

        if ($heroSlides->isEmpty()) {
            $heroSlides = collect([[
                'id' => 1,
                'title' => 'Bazar Ghor',
                'subtitle' => null,
                'link_url' => '/shop',
                'image_url' => asset('images/banner.jpg'),
            ]]);
        }

        return Inertia::render('home', [
            'categories' => $categories,
            'featuredProducts' => $featuredProducts,
            'newArrivals' => $newArrivals,
            'heroMode' => $heroMode,
            'heroSlides' => $heroSlides,
        ]);
    }

    private function formatProduct(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'short_description' => $product->short_description,
            'price' => $product->price,
            'sale_price' => $product->sale_price,
            'effective_price' => $product->effective_price,
            'is_on_sale' => $product->is_on_sale,
            'thumbnail_url' => $product->thumbnail_url,
            'gallery_urls' => $product->gallery_urls,
            'video_url' => $product->video_url,
            'in_stock' => $product->in_stock,
            'has_variants' => $product->has_variants,
            'is_featured' => $product->is_featured,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null,
        ];
    }
}
