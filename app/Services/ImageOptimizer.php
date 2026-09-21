<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageOptimizer
{
    /**
     * Optimize and convert an uploaded image to WebP format,
     * maintaining high visual quality while keeping file size under 50KB - 100KB.
     *
     * @param UploadedFile $file
     * @param string $directory (e.g. 'products')
     * @param int $maxWidth
     * @param int $maxHeight
     * @param int $targetMaxKb
     * @return string Relative storage path (e.g. 'products/abc123xyz.webp')
     */
    public static function optimizeAndStoreWebp(
        UploadedFile $file,
        string $directory = 'products',
        int $maxWidth = 1200,
        int $maxHeight = 1200,
        int $targetMaxKb = 100
    ): string {
        $realPath = $file->getRealPath();
        if (!$realPath || !file_exists($realPath)) {
            // Fallback: standard store if realpath is unavailable
            return $file->store($directory, 'public');
        }

        // If GD or WebP is somehow not available, fallback to standard store
        if (!extension_loaded('gd') || !function_exists('imagewebp')) {
            return $file->store($directory, 'public');
        }

        // Load image resource
        $image = self::createImageFromFile($realPath, $file->getClientMimeType());
        if (!$image) {
            return $file->store($directory, 'public');
        }

        $origWidth = imagesx($image);
        $origHeight = imagesy($image);

        // Calculate resize dimensions while maintaining aspect ratio
        $targetWidth = $origWidth;
        $targetHeight = $origHeight;

        if ($origWidth > $maxWidth || $origHeight > $maxHeight) {
            $ratio = min($maxWidth / $origWidth, $maxHeight / $origHeight);
            $targetWidth = max(1, (int) round($origWidth * $ratio));
            $targetHeight = max(1, (int) round($origHeight * $ratio));
        }

        // Resample image
        $canvas = imagecreatetruecolor($targetWidth, $targetHeight);

        // Preserve alpha transparency for PNG/WebP
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        $transparent = imagecolorallocatealpha($canvas, 255, 255, 255, 127);
        imagefilledrectangle($canvas, 0, 0, $targetWidth, $targetHeight, $transparent);

        imagecopyresampled(
            $canvas,
            $image,
            0, 0, 0, 0,
            $targetWidth,
            $targetHeight,
            $origWidth,
            $origHeight
        );

        imagedestroy($image);

        // Generate a unique filename with .webp extension
        $filename = Str::random(40) . '.webp';
        $destinationPath = $directory . '/' . $filename;
        $fullStoragePath = Storage::disk('public')->path($destinationPath);

        // Ensure directory exists
        $storageDir = dirname($fullStoragePath);
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0755, true);
        }

        // Try quality levels starting from 82 down to 65 to keep size < targetMaxKb
        $quality = 82;
        imagewebp($canvas, $fullStoragePath, $quality);

        if (file_exists($fullStoragePath)) {
            $fileSizeKb = filesize($fullStoragePath) / 1024;

            // If file size exceeds target (e.g. 100KB), re-encode with slightly reduced quality
            if ($fileSizeKb > $targetMaxKb && $quality > 70) {
                imagewebp($canvas, $fullStoragePath, 72);
                $fileSizeKb = filesize($fullStoragePath) / 1024;
            }

            // If still larger, try quality 65
            if ($fileSizeKb > $targetMaxKb) {
                imagewebp($canvas, $fullStoragePath, 65);
            }
        }

        imagedestroy($canvas);

        // Record in Media Library table
        try {
            \App\Models\Media::firstOrCreate(
                ['file_path' => $destinationPath],
                [
                    'filename' => $file->getClientOriginalName() ?: $filename,
                    'disk' => 'public',
                    'mime_type' => 'image/webp',
                    'file_size_kb' => round($fileSizeKb ?? 0, 2),
                    'width' => $targetWidth,
                    'height' => $targetHeight,
                ]
            );
        } catch (\Throwable) {
            // Ignore DB logging error
        }

        return $destinationPath;
    }

    /**
     * Create GD image resource based on file type.
     */
    private static function createImageFromFile(string $path, ?string $mime = null)
    {
        $info = @getimagesize($path);
        $imageType = $info[2] ?? null;

        return match ($imageType) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($path),
            IMAGETYPE_PNG => @imagecreatefrompng($path),
            IMAGETYPE_WEBP => @imagecreatefromwebp($path),
            IMAGETYPE_GIF => @imagecreatefromgif($path),
            default => @imagecreatefromstring(file_get_contents($path)),
        };
    }
}
