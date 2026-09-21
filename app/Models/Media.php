<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    protected $fillable = [
        'filename',
        'file_path',
        'disk',
        'mime_type',
        'file_size_kb',
        'width',
        'height',
        'alt_text',
    ];

    protected $appends = ['url'];

    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Delete physical file when media record is deleted.
     */
    protected static function booted()
    {
        static::deleting(function (Media $media) {
            if ($media->file_path) {
                Storage::disk($media->disk ?? 'public')->delete($media->file_path);
            }
        });
    }
}
