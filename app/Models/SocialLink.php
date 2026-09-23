<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SocialLink extends Model
{
    use HasFactory;

    public const CACHE_KEY = 'storefront_social_links';

    protected $fillable = [
        'platform',
        'title',
        'url',
        'icon',
        'color',
        'is_active',
        'show_in_header',
        'show_in_footer',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'show_in_header' => 'boolean',
        'show_in_footer' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected static function booted(): void
    {
        static::saved(function () {
            Cache::forget(self::CACHE_KEY);
        });

        static::deleted(function () {
            Cache::forget(self::CACHE_KEY);
        });
    }

    /**
     * Get active social links cached for performance.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function getActiveCached(): array
    {
        return Cache::remember(self::CACHE_KEY, 3600, function () {
            return self::query()
                ->where('is_active', true)
                ->orderBy('sort_order', 'asc')
                ->orderBy('id', 'asc')
                ->get()
                ->toArray();
        });
    }

    /**
     * Scope a query to only include active links.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include links meant for header.
     */
    public function scopeHeader($query)
    {
        return $query->where('is_active', true)->where('show_in_header', true);
    }

    /**
     * Scope a query to only include links meant for footer.
     */
    public function scopeFooter($query)
    {
        return $query->where('is_active', true)->where('show_in_footer', true);
    }
}
