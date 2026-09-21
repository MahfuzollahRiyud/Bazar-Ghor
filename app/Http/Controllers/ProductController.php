<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function show(string $slug): Response
    {
        $product = Product::with(['category', 'variants' => fn($q) => $q->where('is_active', true)])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $related = Product::with('category')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->take(4)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'price' => $p->price,
                'sale_price' => $p->sale_price,
                'effective_price' => $p->effective_price,
                'is_on_sale' => $p->is_on_sale,
                'thumbnail_url' => $p->thumbnail_url,
                'in_stock' => $p->in_stock,
                'has_variants' => $p->has_variants,
            ]);

        return Inertia::render('product-detail', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'price' => $product->price,
                'sale_price' => $product->sale_price,
                'effective_price' => $product->effective_price,
                'is_on_sale' => $product->is_on_sale,
                'thumbnail_url' => $product->thumbnail_url,
                'images' => collect($product->images ?? [])->map(fn($img) => str_starts_with($img, 'http') ? $img : asset('storage/' . $img)),
                'video_url' => $product->video_url,
                'has_variants' => $product->has_variants,
                'stock_quantity' => $product->stock_quantity,
                'in_stock' => $product->in_stock,
                'sku' => $product->sku,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ] : null,
                'variants' => $product->variants->map(fn($v) => [
                    'id' => $v->id,
                    'name' => $v->name,
                    'options' => $v->options,
                    'price' => $v->price,
                    'sale_price' => $v->sale_price,
                    'effective_price' => $v->effective_price,
                    'stock_quantity' => $v->stock_quantity,
                    'image' => $v->image ? (str_starts_with($v->image, 'http') ? $v->image : asset('storage/' . $v->image)) : null,
                    'sku' => $v->sku,
                ]),
            ],
            'related' => $related,
        ]);
    }
}
