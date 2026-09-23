<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class CodeSnippet extends Model
{
    use HasFactory;

    public const CACHE_KEY = 'active_storefront_code_snippets';

    protected $fillable = [
        'title',
        'location',
        'code',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
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

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeHeader(Builder $query): Builder
    {
        return $query->where('location', 'header');
    }

    public function scopeBody(Builder $query): Builder
    {
        return $query->where('location', 'body');
    }

    public function scopeFooter(Builder $query): Builder
    {
        return $query->where('location', 'footer');
    }

    /**
     * Get all active snippet codes grouped by location from cache.
     *
     * @return array<string, array<int, string>>
     */
    public static function getActiveGrouped(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            $snippets = static::active()
                ->orderBy('sort_order', 'asc')
                ->orderBy('id', 'asc')
                ->get();

            return [
                'header' => $snippets->where('location', 'header')->pluck('code')->values()->all(),
                'body' => $snippets->where('location', 'body')->pluck('code')->values()->all(),
                'footer' => $snippets->where('location', 'footer')->pluck('code')->values()->all(),
            ];
        });
    }
}
