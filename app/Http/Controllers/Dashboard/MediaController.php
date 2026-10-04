<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Services\ImageOptimizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Media::latest();

        if ($request->filled('search')) {
            $query->where('filename', 'like', '%' . $request->search . '%');
        }

        $media = $query->paginate(24)->withQueryString()->through(fn($m) => [
            'id' => $m->id,
            'filename' => $m->filename,
            'file_path' => $m->file_path,
            'url' => $m->url,
            'mime_type' => $m->mime_type,
            'file_size_kb' => $m->file_size_kb,
            'width' => $m->width,
            'height' => $m->height,
            'created_at' => $m->created_at ? $m->created_at->format('d M Y, h:i A') : '',
        ]);

        $stats = [
            'total' => Media::count(),
            'total_size_mb' => round(Media::sum('file_size_kb') / 1024, 2),
        ];

        return Inertia::render('dashboard/media/index', [
            'media' => $media,
            'stats' => $stats,
            'filters' => [
                'search' => (string) $request->get('search', ''),
            ],
        ]);
    }

    /**
     * API list for MediaPickerModal.
     */
    public function apiList(Request $request): JsonResponse
    {
        $query = Media::latest();

        if ($request->filled('search')) {
            $query->where('filename', 'like', '%' . $request->search . '%');
        }

        $media = $query->paginate(30)->through(fn($m) => [
            'id' => $m->id,
            'filename' => $m->filename,
            'file_path' => $m->file_path,
            'url' => $m->url,
            'mime_type' => $m->mime_type,
            'file_size_kb' => $m->file_size_kb,
            'width' => $m->width,
            'height' => $m->height,
            'created_at' => $m->created_at ? $m->created_at->format('d M Y') : '',
        ]);

        return response()->json($media);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'nullable|image|max:10240',
            'images.*' => 'nullable|image|max:10240',
        ], [
            'image.image' => 'সঠিক ফরম্যাটের ছবি নির্বাচন করুন।',
            'image.max' => 'ছবির সাইজ সর্বোচ্চ 10MB হতে পারে।',
        ]);

        $savedItems = [];

        if ($request->hasFile('image')) {
            $path = ImageOptimizer::optimizeAndStoreWebp($request->file('image'), 'media');
            $media = Media::where('file_path', $path)->first();
            if ($media) $savedItems[] = $media;
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = ImageOptimizer::optimizeAndStoreWebp($file, 'media');
                $media = Media::where('file_path', $path)->first();
                if ($media) $savedItems[] = $media;
            }
        }

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'ছবি সফলভাবে অপ্টিমাইজ ও আপলোড হয়েছে।',
                'items' => $savedItems,
            ]);
        }

        return back()->with('success', 'ছবি সফলভাবে আপলোড ও অপ্টিমাইজ করা হয়েছে।');
    }

    public function destroy(Media $media, Request $request)
    {
        $media->delete();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'মিডিয়া সফলভাবে মুছে ফেলা হয়েছে।');
    }

    /**
     * Delete multiple media items in bulk.
     */
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:media,id',
        ]);

        $count = 0;
        $items = Media::whereIn('id', $validated['ids'])->get();
        foreach ($items as $item) {
            $item->delete();
            $count++;
        }

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => "{$count}টি মিডিয়া সফলভাবে মুছে ফেলা হয়েছে।",
                'deleted_count' => $count,
            ]);
        }

        return back()->with('success', "{$count}টি মিডিয়া সফলভাবে মুছে ফেলা হয়েছে।");
    }

    /**
     * Download multiple media items as a ZIP.
     */
    public function bulkDownload(Request $request)
    {
        $ids = $request->input('ids');
        if (is_string($ids)) {
            $ids = explode(',', $ids);
        }

        $ids = array_filter(array_map('intval', (array) $ids));
        if (empty($ids)) {
            return back()->with('error', 'কোনো ছবি নির্বাচন করা হয়নি।');
        }

        $items = Media::whereIn('id', $ids)->get();
        if ($items->isEmpty()) {
            return back()->with('error', 'কোনো মিডিয়া পাওয়া যায়নি।');
        }

        $zipFileName = 'bazarghor_media_' . date('Ymd_His') . '.zip';
        $zipPath = storage_path('app/' . $zipFileName);

        $zip = new \ZipArchive();
        if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === true) {
            foreach ($items as $item) {
                $disk = $item->disk ?? 'public';
                if (Storage::disk($disk)->exists($item->file_path)) {
                    $fileContent = Storage::disk($disk)->get($item->file_path);
                    $cleanName = basename($item->file_path);
                    $zip->addFromString($cleanName, $fileContent);
                }
            }
            $zip->close();
        }

        if (file_exists($zipPath)) {
            return response()->download($zipPath)->deleteFileAfterSend(true);
        }

        return back()->with('error', 'ZIP ফাইল তৈরি করা সম্ভব হয়নি।');
    }
}
