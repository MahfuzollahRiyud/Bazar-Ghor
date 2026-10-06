<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\ImageOptimizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->get('status', 'all');

        if ($status === 'trash') {
            $query = Product::onlyTrashed()->with(['category', 'categories']);
        } else {
            $query = Product::with(['category', 'categories']);
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Search by name or SKU
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        // Filter by Category
        if ($request->filled('category_id')) {
            $catId = $request->category_id;
            $query->where(function ($q) use ($catId) {
                $q->where('category_id', $catId)
                  ->orWhereHas('categories', fn($sq) => $sq->where('categories.id', $catId));
            });
        }

        // Filter by Stock Status
        if ($request->filled('stock_status')) {
            if ($request->stock_status === 'in_stock') {
                $query->where(function ($q) {
                    $q->where('stock_quantity', '>', 0)
                        ->orWhere('has_variants', true);
                });
            } elseif ($request->stock_status === 'out_of_stock') {
                $query->where('stock_quantity', '<=', 0)
                    ->where('has_variants', false);
            }
        }

        // Sorting (A to Z, Z to A, Price, Date)
        switch ($request->get('sort')) {
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'oldest':
                $query->oldest();
                break;
            case 'stock_desc':
                $query->orderBy('stock_quantity', 'desc');
                break;
            default:
                $query->latest();
                break;
        }

        $perPage = $request->get('per_page', 15);
        $products = $query->paginate($perPage)->withQueryString()->through(fn($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'sku' => $p->sku,
            'price' => $p->price,
            'sale_price' => $p->sale_price,
            'cost_price' => $p->cost_price,
            'stock_quantity' => $p->stock_quantity,
            'sold_count' => $p->sold_count ?? 0,
            'show_stock_on_card' => (bool) $p->show_stock_on_card,
            'thumbnail_url' => $p->thumbnail_url,
            'is_active' => $p->is_active,
            'is_featured' => $p->is_featured,
            'has_variants' => $p->has_variants,
            'category' => $p->categories->isNotEmpty() ? $p->categories->pluck('name')->join(', ') : ($p->category?->name ?? '—'),
            'category_id' => $p->category_id,
            'category_ids' => $p->categories->pluck('id')->toArray(),
            'categories' => $p->categories->map(fn($c) => ['id' => $c->id, 'name' => $c->name]),
            'is_trashed' => $p->trashed(),
            'deleted_at' => $p->deleted_at ? $p->deleted_at->format('d M Y, h:i A') : null,
            'created_at' => $p->created_at ? $p->created_at->format('d M Y') : '',
        ]);

        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        // WooCommerce / WordPress-style product counts
        $stats = [
            'all' => Product::count(),
            'total' => Product::count(),
            'active' => Product::where('is_active', true)->count(),
            'inactive' => Product::where('is_active', false)->count(),
            'in_stock' => Product::where('stock_quantity', '>', 0)->orWhere('has_variants', true)->count(),
            'out_of_stock' => Product::where('stock_quantity', '<=', 0)->where('has_variants', false)->count(),
            'trash' => Product::onlyTrashed()->count(),
        ];

        return Inertia::render('dashboard/products/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => (string) $request->get('search', ''),
                'category_id' => (string) $request->get('category_id', ''),
                'stock_status' => (string) $request->get('stock_status', ''),
                'status' => (string) $status,
                'sort' => (string) $request->get('sort', ''),
            ],
            'stats' => $stats,
        ]);
    }

    public function create(): Response
    {
        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        return Inertia::render('dashboard/products/create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // Normalize boolean and numeric inputs so formData string representations never fail validation
        $request->merge([
            'has_variants' => filter_var($request->has_variants, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false,
            'is_featured' => filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false,
            'is_active' => filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? true,
            'sale_price' => $request->filled('sale_price') ? $request->sale_price : null,
            'cost_price' => $request->filled('cost_price') ? $request->cost_price : null,
            'sku' => $request->filled('sku') ? $request->sku : null,
            'stock_quantity' => $request->filled('stock_quantity') ? (int) $request->stock_quantity : 0,
        ]);

        $categoryIds = [];
        if ($request->has('category_ids') && is_array($request->category_ids)) {
            $categoryIds = array_values(array_filter(array_map('intval', $request->category_ids)));
        } elseif ($request->filled('category_id')) {
            $categoryIds = [(int) $request->category_id];
        }

        if (empty($categoryIds)) {
            return back()->withErrors(['category_ids' => 'কমপক্ষে একটি ক্যাটাগরি নির্বাচন করুন।'])->withInput();
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'category_id' => 'nullable|exists:categories,id',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lt:price',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'nullable|integer|min:0',
            'sold_count' => 'nullable|integer|min:0',
            'show_stock_on_card' => 'boolean',
            'video_url' => 'nullable|string|max:500',
            'card_video_url' => 'nullable|string|max:500',
            'show_card_video_on_detail' => 'boolean',
            'has_variants' => 'boolean',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'thumbnail' => 'nullable|image|max:5120',
            'media_thumbnail_path' => 'nullable|string',
            'media_image_paths' => 'nullable|array',
            'images.*' => 'nullable|image|max:5120',
            'media_review_image_paths' => 'nullable|array',
            'review_image_files.*' => 'nullable|image|max:5120',
            'variants' => 'nullable|array',
        ], [
            'name.required' => 'পণ্যের নাম দেওয়া আবশ্যক।',
            'category_ids.required' => 'একটি ক্যাটাগরি নির্বাচন করুন।',
            'category_id.required' => 'একটি ক্যাটাগরি নির্বাচন করুন।',
            'category_id.exists' => 'নির্বাচিত ক্যাটাগরিটি সঠিক নয়।',
            'price.required' => 'পণ্যের দাম নির্ধারণ করুন।',
            'price.numeric' => 'দাম একটি সঠিক সংখ্যা হতে হবে।',
            'sale_price.lt' => 'অফার মূল্য মূল মূল্যের চেয়ে কম হতে হবে।',
            'sku.unique' => 'এই SKU কোডটি ইতিমধ্যে ব্যবহৃত হয়েছে।',
            'thumbnail.image' => 'থাম্বনেইল একটি সঠিক ছবি (JPG, PNG) হতে হবে।',
        ]);

        $thumbnailPath = null;
        if ($request->filled('media_thumbnail_path')) {
            $thumbnailPath = $request->media_thumbnail_path;
        } elseif ($request->hasFile('thumbnail')) {
            $thumbnailPath = ImageOptimizer::optimizeAndStoreWebp($request->file('thumbnail'), 'products');
        }

        $imagePaths = [];
        if ($request->has('media_image_paths') && is_array($request->media_image_paths)) {
            $imagePaths = array_merge($imagePaths, $request->media_image_paths);
        }
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $imagePaths[] = ImageOptimizer::optimizeAndStoreWebp($image, 'products');
            }
        }

        $reviewImagePaths = [];
        if ($request->has('media_review_image_paths') && is_array($request->media_review_image_paths)) {
            $reviewImagePaths = array_merge($reviewImagePaths, $request->media_review_image_paths);
        }
        if ($request->hasFile('review_image_files')) {
            foreach ($request->file('review_image_files') as $rImage) {
                $reviewImagePaths[] = ImageOptimizer::optimizeAndStoreWebp($rImage, 'reviews');
            }
        }

        $primaryCategoryId = $categoryIds[0];

        $product = Product::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Str::random(5),
            'category_id' => $primaryCategoryId,
            'short_description' => $request->short_description,
            'description' => $request->description,
            'sku' => $request->sku,
            'price' => $request->price,
            'sale_price' => $request->sale_price,
            'cost_price' => $request->cost_price,
            'stock_quantity' => $request->has_variants ? 0 : ($request->stock_quantity ?? 0),
            'sold_count' => $request->filled('sold_count') ? (int) $request->sold_count : 0,
            'show_stock_on_card' => $request->boolean('show_stock_on_card'),
            'video_url' => $request->filled('video_url') ? trim($request->video_url) : null,
            'card_video_url' => $request->filled('card_video_url') ? trim($request->card_video_url) : null,
            'show_card_video_on_detail' => $request->boolean('show_card_video_on_detail'),
            'has_variants' => $request->boolean('has_variants'),
            'is_featured' => $request->boolean('is_featured'),
            'is_active' => $request->boolean('is_active', true),
            'thumbnail' => $thumbnailPath,
            'images' => $imagePaths ?: null,
            'review_images' => $reviewImagePaths ?: null,
        ]);

        $product->categories()->sync($categoryIds);

        if ($request->boolean('has_variants') && $request->variants) {
            foreach ($request->variants as $variant) {
                if (empty($variant['name'])) continue;
                ProductVariant::create([
                    'product_id' => $product->id,
                    'name' => $variant['name'],
                    'options' => $variant['options'] ?? [],
                    'sku' => $variant['sku'] ?? null,
                    'price' => !empty($variant['price']) ? $variant['price'] : $request->price,
                    'sale_price' => !empty($variant['sale_price']) ? $variant['sale_price'] : null,
                    'cost_price' => !empty($variant['cost_price']) ? $variant['cost_price'] : ($request->filled('cost_price') ? $request->cost_price : null),
                    'stock_quantity' => isset($variant['stock_quantity']) && $variant['stock_quantity'] !== '' ? (int) $variant['stock_quantity'] : 0,
                    'is_active' => true,
                ]);
            }
        }

        return redirect()->route('dashboard.products.index')
            ->with('success', 'পণ্য সফলভাবে তৈরি হয়েছে।');
    }

    public function edit(Product $product): Response
    {
        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $product->load(['variants', 'categories']);

        return Inertia::render('dashboard/products/edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'category_id' => $product->category_id,
                'category_ids' => $product->categories->isNotEmpty()
                    ? $product->categories->pluck('id')->toArray()
                    : ($product->category_id ? [$product->category_id] : []),
                'short_description' => $product->short_description,
                'description' => $product->description,
                'sku' => $product->sku,
                'price' => $product->price,
                'sale_price' => $product->sale_price,
                'cost_price' => $product->cost_price,
                'stock_quantity' => $product->stock_quantity,
                'sold_count' => $product->sold_count ?? 0,
                'show_stock_on_card' => (bool) $product->show_stock_on_card,
                'has_variants' => $product->has_variants,
                'is_featured' => $product->is_featured,
                'is_active' => $product->is_active,
                'thumbnail_url' => $product->thumbnail_url,
                'video_url' => $product->video_url,
                'card_video_url' => $product->card_video_url,
                'show_card_video_on_detail' => (bool) $product->show_card_video_on_detail,
                'images' => collect($product->images ?? [])->map(fn($img) => [
                    'path' => $img,
                    'url' => str_starts_with($img, 'http') ? $img : asset('storage/' . $img),
                ]),
                'review_images' => collect($product->review_images ?? [])->map(fn($img) => [
                    'path' => $img,
                    'url' => str_starts_with($img, 'http') ? $img : asset('storage/' . $img),
                ]),
                'variants' => $product->variants->map(fn($v) => [
                    'id' => $v->id,
                    'name' => $v->name,
                    'options' => $v->options,
                    'sku' => $v->sku,
                    'price' => $v->price,
                    'sale_price' => $v->sale_price,
                    'cost_price' => $v->cost_price,
                    'stock_quantity' => $v->stock_quantity,
                    'is_active' => $v->is_active,
                ]),
            ],
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        // Normalize boolean and numeric inputs
        $request->merge([
            'has_variants' => filter_var($request->has_variants, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false,
            'is_featured' => filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false,
            'is_active' => filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? true,
            'show_stock_on_card' => filter_var($request->show_stock_on_card, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false,
            'show_card_video_on_detail' => filter_var($request->show_card_video_on_detail, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false,
            'sold_count' => $request->filled('sold_count') ? (int) $request->sold_count : 0,
            'sale_price' => $request->filled('sale_price') ? $request->sale_price : null,
            'cost_price' => $request->filled('cost_price') ? $request->cost_price : null,
            'sku' => $request->filled('sku') ? $request->sku : null,
            'stock_quantity' => $request->filled('stock_quantity') ? (int) $request->stock_quantity : 0,
        ]);

        $categoryIds = [];
        if ($request->has('category_ids') && is_array($request->category_ids)) {
            $categoryIds = array_values(array_filter(array_map('intval', $request->category_ids)));
        } elseif ($request->filled('category_id')) {
            $categoryIds = [(int) $request->category_id];
        }

        if (empty($categoryIds)) {
            return back()->withErrors(['category_ids' => 'কমপক্ষে একটি ক্যাটাগরি নির্বাচন করুন।'])->withInput();
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'category_id' => 'nullable|exists:categories,id',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $product->id,
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lt:price',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'nullable|integer|min:0',
            'sold_count' => 'nullable|integer|min:0',
            'show_stock_on_card' => 'boolean',
            'video_url' => 'nullable|string|max:500',
            'card_video_url' => 'nullable|string|max:500',
            'show_card_video_on_detail' => 'boolean',
            'has_variants' => 'boolean',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'thumbnail' => 'nullable|image|max:5120',
            'media_thumbnail_path' => 'nullable|string',
            'media_image_paths' => 'nullable|array',
            'images.*' => 'nullable|image|max:5120',
            'existing_review_images' => 'nullable|array',
            'media_review_image_paths' => 'nullable|array',
            'review_image_files.*' => 'nullable|image|max:5120',
            'variants' => 'nullable|array',
        ], [
            'name.required' => 'পণ্যের নাম দেওয়া আবশ্যক।',
            'category_ids.required' => 'একটি ক্যাটাগরি নির্বাচন করুন।',
            'category_id.required' => 'একটি ক্যাটাগরি নির্বাচন করুন।',
            'category_id.exists' => 'নির্বাচিত ক্যাটাগরিটি সঠিক নয়।',
            'price.required' => 'পণ্যের দাম নির্ধারণ করুন।',
            'price.numeric' => 'দাম একটি সঠিক সংখ্যা হতে হবে।',
            'sale_price.lt' => 'অফার মূল্য মূল মূল্যের চেয়ে কম হতে হবে।',
            'sku.unique' => 'এই SKU কোডটি ইতিমধ্যে ব্যবহৃত হয়েছে।',
        ]);

        $thumbnailPath = $product->thumbnail;
        if ($request->filled('media_thumbnail_path')) {
            $thumbnailPath = $request->media_thumbnail_path;
        } elseif ($request->hasFile('thumbnail')) {
            if ($product->thumbnail) Storage::disk('public')->delete($product->thumbnail);
            $thumbnailPath = ImageOptimizer::optimizeAndStoreWebp($request->file('thumbnail'), 'products');
        }

        $imagePaths = $product->images ?? [];
        if ($request->has('media_image_paths') && is_array($request->media_image_paths)) {
            $imagePaths = array_merge($imagePaths, $request->media_image_paths);
        }
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $imagePaths[] = ImageOptimizer::optimizeAndStoreWebp($image, 'products');
            }
        }

        $reviewImagePaths = [];
        if ($request->has('existing_review_images') && is_array($request->existing_review_images)) {
            $reviewImagePaths = array_values(array_filter($request->existing_review_images));
        } elseif (!$request->has('existing_review_images') && is_array($product->review_images)) {
            $reviewImagePaths = $product->review_images;
        }
        if ($request->has('media_review_image_paths') && is_array($request->media_review_image_paths)) {
            $reviewImagePaths = array_merge($reviewImagePaths, $request->media_review_image_paths);
        }
        if ($request->hasFile('review_image_files')) {
            foreach ($request->file('review_image_files') as $rImage) {
                $reviewImagePaths[] = ImageOptimizer::optimizeAndStoreWebp($rImage, 'reviews');
            }
        }

        $primaryCategoryId = $categoryIds[0];

        $product->update([
            'name' => $request->name,
            'category_id' => $primaryCategoryId,
            'short_description' => $request->short_description,
            'description' => $request->description,
            'sku' => $request->sku,
            'price' => $request->price,
            'sale_price' => $request->sale_price,
            'cost_price' => $request->cost_price,
            'stock_quantity' => $request->has_variants ? 0 : ($request->stock_quantity ?? 0),
            'sold_count' => $request->sold_count,
            'show_stock_on_card' => $request->show_stock_on_card,
            'video_url' => $request->filled('video_url') ? trim($request->video_url) : null,
            'card_video_url' => $request->filled('card_video_url') ? trim($request->card_video_url) : null,
            'show_card_video_on_detail' => $request->boolean('show_card_video_on_detail'),
            'has_variants' => $request->boolean('has_variants'),
            'is_featured' => $request->boolean('is_featured'),
            'is_active' => $request->boolean('is_active'),
            'thumbnail' => $thumbnailPath,
            'images' => $imagePaths ?: null,
            'review_images' => $reviewImagePaths ?: null,
        ]);

        $product->categories()->sync($categoryIds);

        // Sync variants
        if ($request->boolean('has_variants') && $request->variants) {
            $existingIds = [];
            foreach ($request->variants as $variantData) {
                if (empty($variantData['name'])) continue;
                $vPrice = !empty($variantData['price']) ? $variantData['price'] : $request->price;
                $vSalePrice = !empty($variantData['sale_price']) ? $variantData['sale_price'] : null;
                $vCostPrice = !empty($variantData['cost_price']) ? $variantData['cost_price'] : ($request->filled('cost_price') ? $request->cost_price : null);
                $vQty = isset($variantData['stock_quantity']) && $variantData['stock_quantity'] !== '' ? (int) $variantData['stock_quantity'] : 0;

                if (!empty($variantData['id'])) {
                    $variant = ProductVariant::find($variantData['id']);
                    if ($variant) {
                        $variant->update([
                            'name' => $variantData['name'],
                            'options' => $variantData['options'] ?? [],
                            'sku' => $variantData['sku'] ?? null,
                            'price' => $vPrice,
                            'sale_price' => $vSalePrice,
                            'cost_price' => $vCostPrice,
                            'stock_quantity' => $vQty,
                        ]);
                        $existingIds[] = $variant->id;
                    }
                } else {
                    $newVariant = ProductVariant::create([
                        'product_id' => $product->id,
                        'name' => $variantData['name'],
                        'options' => $variantData['options'] ?? [],
                        'sku' => $variantData['sku'] ?? null,
                        'price' => $vPrice,
                        'sale_price' => $vSalePrice,
                        'cost_price' => $vCostPrice,
                        'stock_quantity' => $vQty,
                        'is_active' => true,
                    ]);
                    $existingIds[] = $newVariant->id;
                }
            }
            $product->variants()->whereNotIn('id', $existingIds)->delete();
        }

        return redirect()->route('dashboard.products.index')
            ->with('success', 'পণ্য সফলভাবে আপডেট হয়েছে।');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return back()->with('success', 'পণ্যটি ট্র্যাশে সরানো হয়েছে।');
    }

    public function restore(int $id): RedirectResponse
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        $product->restore();

        return back()->with('success', 'পণ্যটি সফলভাবে পুনরুদ্ধার (Restore) করা হয়েছে।');
    }

    public function forceDelete(int $id): RedirectResponse
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        if ($product->thumbnail) Storage::disk('public')->delete($product->thumbnail);
        foreach ($product->images ?? [] as $img) {
            Storage::disk('public')->delete($img);
        }
        $product->forceDelete();

        return back()->with('success', 'পণ্যটি স্থায়ীভাবে মুছে ফেলা হয়েছে।');
    }

    public function bulkAction(Request $request): RedirectResponse
    {
        $request->validate([
            'action' => 'required|in:trash,restore,force_delete',
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer',
        ]);

        $ids = $request->ids;
        $action = $request->action;

        if ($action === 'trash') {
            Product::whereIn('id', $ids)->delete();
            return back()->with('success', count($ids) . 'টি পণ্য ট্র্যাশে সরানো হয়েছে।');
        }

        if ($action === 'restore') {
            Product::onlyTrashed()->whereIn('id', $ids)->restore();
            return back()->with('success', count($ids) . 'টি পণ্য পুনরুদ্ধার করা হয়েছে।');
        }

        if ($action === 'force_delete') {
            $products = Product::onlyTrashed()->whereIn('id', $ids)->get();
            foreach ($products as $p) {
                if ($p->thumbnail) Storage::disk('public')->delete($p->thumbnail);
                foreach ($p->images ?? [] as $img) {
                    Storage::disk('public')->delete($img);
                }
                $p->forceDelete();
            }
            return back()->with('success', count($products) . 'টি পণ্য স্থায়ীভাবে মুছে ফেলা হয়েছে।');
        }

        return back();
    }
}
