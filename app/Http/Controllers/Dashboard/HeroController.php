<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use App\Models\SiteSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HeroController extends Controller
{
    public function index(): Response
    {
        $heroMode = SiteSetting::get('hero_mode', 'single');
        $slides = HeroSlide::orderBy('sort_order', 'asc')->get();

        return Inertia::render('dashboard/hero/index', [
            'heroMode' => $heroMode,
            'slides' => $slides,
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'hero_mode' => 'required|in:single,slider',
        ]);

        SiteSetting::set('hero_mode', $validated['hero_mode']);

        return back()->with('success', 'Hero section display mode updated successfully.');
    }

    public function storeSlide(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'link_url' => 'nullable|string|max:500',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:15360', // Up to 15MB
            'media_image_path' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
        ]);

        $imagePath = null;

        // 1. Check for Media Library path selection
        if (!empty($validated['media_image_path'])) {
            $imagePath = $validated['media_image_path'];
        }
        // 2. Direct file upload: Store 100% original uncompressed image (per user specification to avoid any blur)
        elseif ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = 'hero_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('hero', $filename, 'public');
            $imagePath = $path;
        }

        if (!$imagePath) {
            return back()->withErrors(['image' => 'Please upload a banner image or select one from the Media Library.']);
        }

        $nextSortOrder = (HeroSlide::max('sort_order') ?? 0) + 1;

        HeroSlide::create([
            'image_path' => $imagePath,
            'title' => $validated['title'] ?? null,
            'subtitle' => $validated['subtitle'] ?? null,
            'link_url' => $validated['link_url'] ?? null,
            'sort_order' => $nextSortOrder,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Hero banner slide added successfully.');
    }

    public function updateSlide(Request $request, HeroSlide $slide): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'link_url' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:15360',
            'media_image_path' => 'nullable|string|max:500',
        ]);

        $updateData = [
            'title' => $validated['title'] ?? null,
            'subtitle' => $validated['subtitle'] ?? null,
            'link_url' => $validated['link_url'] ?? null,
            'is_active' => $request->boolean('is_active', $slide->is_active),
        ];

        if (isset($validated['sort_order'])) {
            $updateData['sort_order'] = (int) $validated['sort_order'];
        }

        if (!empty($validated['media_image_path'])) {
            $updateData['image_path'] = $validated['media_image_path'];
        } elseif ($request->hasFile('image')) {
            // Delete old file if stored in public storage and not /images/
            if (!str_starts_with($slide->image_path, '/images/') && Storage::disk('public')->exists($slide->image_path)) {
                Storage::disk('public')->delete($slide->image_path);
            }
            $file = $request->file('image');
            $filename = 'hero_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $updateData['image_path'] = $file->storeAs('hero', $filename, 'public');
        }

        $slide->update($updateData);

        return back()->with('success', 'Hero slide updated successfully.');
    }

    public function destroySlide(HeroSlide $slide): RedirectResponse
    {
        if (HeroSlide::count() <= 1) {
            return back()->withErrors(['general' => 'At least one hero banner is required. You cannot delete the only remaining slide.']);
        }

        if (!str_starts_with($slide->image_path, '/images/') && Storage::disk('public')->exists($slide->image_path)) {
            Storage::disk('public')->delete($slide->image_path);
        }

        $slide->delete();

        return back()->with('success', 'Hero slide deleted successfully.');
    }

    public function reorderSlides(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'slide_ids' => 'required|array',
            'slide_ids.*' => 'integer|exists:hero_slides,id',
        ]);

        foreach ($validated['slide_ids'] as $index => $id) {
            HeroSlide::where('id', $id)->update(['sort_order' => $index + 1]);
        }

        return back()->with('success', 'Slide order updated successfully.');
    }

    public function toggleStatus(HeroSlide $slide): RedirectResponse
    {
        $slide->update(['is_active' => !$slide->is_active]);

        return back()->with('success', 'Slide status updated.');
    }
}
