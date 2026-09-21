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
        $query = Product::with('category');

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
            $query->where('category_id', $request->category_id);
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

        // Filter by Status (Active / Inactive)
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
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
            'stock_quantity' => $p->stock_quantity,
            'thumbnail_url' => $p->thumbnail_url,
            'is_active' => $p->is_active,
            'is_featured' => $p->is_featured,
            'has_variants' => $p->has_variants,
            'category' => $p->category?->name,
            'category_id' => $p->category_id,
            'created_at' => $p->created_at ? $p->created_at->format('d M Y') : '',
        ]);

        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        // WooCommerce-style product counts
        $stats = [
            'total' => Product::count(),
            'in_stock' => Product::where('stock_quantity', '>', 0)->orWhere('has_variants', true)->count(),
            'out_of_stock' => Product::where('stock_quantity', '<=', 0)->where('has_variants', false)->count(),
            'active' => Product::where('is_active', true)->count(),
        ];

        return Inertia::render('dashboard/products/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => (string) $request->get('search', ''),
                'category_id' => (string) $request->get('category_id', ''),
                'stock_status' => (string) $request->get('stock_status', ''),
                'status' => (string) $request->get('status', ''),
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
            'sku' => $request->filled('sku') ? $request->sku : null,
            'stock_quantity' => $request->filled('stock_quantity') ? (int) $request->stock_quantity : 0,
        ]);

        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lt:price',
            'stock_quantity' => 'nullable|integer|min:0',
            'video_url' => 'nullable|string|max:500',
            'has_variants' => 'boolean',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'thumbnail' => 'nullable|image|max:5120',
            'media_thumbnail_path' => 'nullable|string',
            'media_image_paths' => 'nullable|array',
            'images.*' => 'nullable|image|max:5120',
            'variants' => 'nullable|array',
        ], [
            'name.required' => 'পণ্যের নাম দেওয়া আবশ্যক।',
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

        $product = Product::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Str::random(5),
            'category_id' => $request->category_id,
            'short_description' => $request->short_description,
            'description' => $request->description,
            'sku' => $request->sku,
            'price' => $request->price,
            'sale_price' => $request->sale_price,
            'stock_quantity' => $request->has_variants ? 0 : ($request->stock_quantity ?? 0),
            'video_url' => $request->video_url,
            'has_variants' => $request->boolean('has_variants'),
            'is_featured' => $request->boolean('is_featured'),
            'is_active' => $request->boolean('is_active', true),
            'thumbnail' => $thumbnailPath,
            'images' => $imagePaths ?: null,
        ]);

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
                    'stock_quantity' => isset($variant['stock_quantity']) && $variant['stock_quantity'] !== '' ? (int) $variant['stock_quantity'] : 0,
                    'is_active' => true,
                ]);
            }
        }

        return redirect()->route('dashboard.products.index')
            ->with('success', 'পণ্য সফলভাবে যোগ করা হয়েছে।');
    }

    public function edit(Product $product): Response
    {
        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $product->load('variants');

        return Inertia::render('dashboard/products/edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'category_id' => $product->category_id,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'sku' => $product->sku,
                'price' => $product->price,
                'sale_price' => $product->sale_price,
                'stock_quantity' => $product->stock_quantity,
                'has_variants' => $product->has_variants,
                'is_featured' => $product->is_featured,
                'is_active' => $product->is_active,
                'thumbnail_url' => $product->thumbnail_url,
                'video_url' => $product->video_url,
                'images' => collect($product->images ?? [])->map(fn($img) => [
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
            'sale_price' => $request->filled('sale_price') ? $request->sale_price : null,
            'sku' => $request->filled('sku') ? $request->sku : null,
            'stock_quantity' => $request->filled('stock_quantity') ? (int) $request->stock_quantity : 0,
        ]);

        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $product->id,
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lt:price',
            'stock_quantity' => 'nullable|integer|min:0',
            'video_url' => 'nullable|string|max:500',
            'has_variants' => 'boolean',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'thumbnail' => 'nullable|image|max:5120',
            'media_thumbnail_path' => 'nullable|string',
            'media_image_paths' => 'nullable|array',
            'images.*' => 'nullable|image|max:5120',
            'variants' => 'nullable|array',
        ], [
            'name.required' => 'পণ্যের নাম দেওয়া আবশ্যক।',
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

        $product->update([
            'name' => $request->name,
            'category_id' => $request->category_id,
            'short_description' => $request->short_description,
            'description' => $request->description,
            'sku' => $request->sku,
            'price' => $request->price,
            'sale_price' => $request->sale_price,
            'stock_quantity' => $request->has_variants ? 0 : ($request->stock_quantity ?? 0),
            'video_url' => $request->video_url,
            'has_variants' => $request->boolean('has_variants'),
            'is_featured' => $request->boolean('is_featured'),
            'is_active' => $request->boolean('is_active'),
            'thumbnail' => $thumbnailPath,
            'images' => $imagePaths ?: null,
        ]);

        // Sync variants
        if ($request->boolean('has_variants') && $request->variants) {
            $existingIds = [];
            foreach ($request->variants as $variantData) {
                if (empty($variantData['name'])) continue;
                $vPrice = !empty($variantData['price']) ? $variantData['price'] : $request->price;
                $vSalePrice = !empty($variantData['sale_price']) ? $variantData['sale_price'] : null;
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
        if ($product->thumbnail) Storage::disk('public')->delete($product->thumbnail);
        foreach ($product->images ?? [] as $img) {
            Storage::disk('public')->delete($img);
        }
        $product->delete();

        return back()->with('success', 'পণ্য মুছে ফেলা হয়েছে।');
    }
}
