<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'short_description',
        'description',
        'sku',
        'price',
        'sale_price',
        'thumbnail',
        'images',
        'video_url',
        'has_variants',
        'stock_quantity',
        'is_featured',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'images' => 'array',
        'has_variants' => 'boolean',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
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
