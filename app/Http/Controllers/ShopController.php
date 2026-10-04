<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with(['category', 'categories'])->where('is_active', true);

        if ($request->filled('category')) {
            $catSlug = $request->category;
            $query->where(function ($q) use ($catSlug) {
                $q->whereHas('categories', fn($sq) => $sq->where('slug', $catSlug))
                  ->orWhereHas('category', fn($sq) => $sq->where('slug', $catSlug));
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%")
                ->orWhere('short_description', 'like', "%{$search}%"));
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->sort === 'price_asc') {
            $query->orderBy('price');
        } elseif ($request->sort === 'price_desc') {
            $query->orderByDesc('price');
        } elseif ($request->sort === 'newest') {
            $query->latest();
        } else {
            $query->orderBy('sort_order')->orderByDesc('is_featured');
        }

        $products = $query->paginate(12)->through(fn($p) => $this->formatProduct($p));

        $categories = Category::where('is_active', true)
            ->orderBy('sort_order')
            ->withCount(['products' => fn($q) => $q->where('is_active', true)])
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'products_count' => $c->products_count,
            ]);

        return Inertia::render('shop', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['category', 'search', 'min_price', 'max_price', 'sort']),
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
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null,
        ];
    }

    public function suggestions(Request $request)
    {
        $query = trim((string) $request->get('q', ''));
        if (strlen($query) < 1) {
            return response()->json([]);
        }

        $products = Product::where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('sku', 'like', "%{$query}%")
                  ->orWhere('short_description', 'like', "%{$query}%");
            })
            ->take(8)
            ->get();

        return response()->json($products->map(fn($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'sku' => $p->sku,
            'price' => $p->price,
            'sale_price' => $p->sale_price,
            'effective_price' => $p->effective_price,
            'is_on_sale' => $p->is_on_sale,
            'thumbnail_url' => $p->thumbnail_url,
        ]));
    }
}
