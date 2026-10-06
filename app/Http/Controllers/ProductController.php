<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function show(string $slug): Response
    {
        $product = Product::with(['category', 'categories', 'variants' => fn($q) => $q->where('is_active', true)])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $categoryIds = $product->categories->pluck('id')->toArray();
        if (empty($categoryIds) && $product->category_id) {
            $categoryIds = [$product->category_id];
        }

        $related = Product::with(['category', 'categories'])
            ->where(function ($q) use ($categoryIds) {
                $q->whereIn('category_id', $categoryIds)
                  ->orWhereHas('categories', fn($sq) => $sq->whereIn('categories.id', $categoryIds));
            })
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
                'gallery_urls' => $p->gallery_urls,
                'video_url' => $p->video_url,
                'card_video_url' => $p->card_video_url,
                'in_stock' => $p->in_stock,
                'stock_quantity' => $p->stock_quantity,
                'sold_count' => $p->sold_count ?? 0,
                'show_stock_on_card' => (bool) $p->show_stock_on_card,
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
                'review_image_urls' => $product->review_image_urls,
                'video_url' => $product->video_url,
                'card_video_url' => $product->card_video_url,
                'show_card_video_on_detail' => (bool) $product->show_card_video_on_detail,
                'has_variants' => $product->has_variants,
                'stock_quantity' => $product->stock_quantity,
                'sold_count' => $product->sold_count ?? 0,
                'show_stock_on_card' => (bool) $product->show_stock_on_card,
                'in_stock' => $product->in_stock,
                'sku' => $product->sku,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ] : ($product->categories->first() ? [
                    'id' => $product->categories->first()->id,
                    'name' => $product->categories->first()->name,
                    'slug' => $product->categories->first()->slug,
                ] : null),
                'categories' => $product->categories->map(fn($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'slug' => $c->slug,
                ]),
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
