<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'short_description',
        'description',
        'sku',
        'price',
        'sale_price',
        'cost_price',
        'thumbnail',
        'images',
        'review_images',
        'video_url',
        'card_video_url',
        'show_card_video_on_detail',
        'has_variants',
        'stock_quantity',
        'sold_count',
        'show_stock_on_card',
        'is_featured',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'images' => 'array',
        'review_images' => 'array',
        'has_variants' => 'boolean',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'show_stock_on_card' => 'boolean',
        'sold_count' => 'integer',
        'show_card_video_on_detail' => 'boolean',
    ];

    protected $appends = [
        'thumbnail_url',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        if (!$this->thumbnail) return null;
        if (str_starts_with($this->thumbnail, 'http')) return $this->thumbnail;
        return asset('storage/' . $this->thumbnail);
    }

    public function getGalleryUrlsAttribute(): array
    {
        $urls = [];
        if ($this->thumbnail_url) {
            $urls[] = $this->thumbnail_url;
        }

        if (is_array($this->images)) {
            foreach ($this->images as $img) {
                if (!$img) continue;
                $url = str_starts_with($img, 'http') ? $img : asset('storage/' . $img);
                if (!in_array($url, $urls)) {
                    $urls[] = $url;
                }
            }
        }

        return $urls;
    }

    public function getReviewImageUrlsAttribute(): array
    {
        $urls = [];
        if (is_array($this->review_images)) {
            foreach ($this->review_images as $img) {
                if (!$img) continue;
                $url = str_starts_with($img, 'http') ? $img : asset('storage/' . $img);
                if (!in_array($url, $urls)) {
                    $urls[] = $url;
                }
            }
        }
        return $urls;
    }

    public function getEffectivePriceAttribute(): string
    {
        return $this->sale_price ?? $this->price;
    }

    public function getIsOnSaleAttribute(): bool
    {
        return !is_null($this->sale_price) && $this->sale_price < $this->price;
    }

    public function getInStockAttribute(): bool
    {
        if ($this->has_variants) {
            return $this->variants()->where('stock_quantity', '>', 0)->exists();
        }
        return $this->stock_quantity > 0;
    }
}
