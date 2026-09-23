<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\SocialLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SocialLinkController extends Controller
{
    /**
     * Display a listing of social media links.
     */
    public function index(): Response
    {
        $links = SocialLink::query()
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $stats = [
            'total' => $links->count(),
            'active' => $links->where('is_active', true)->count(),
            'header' => $links->where('is_active', true)->where('show_in_header', true)->count(),
            'footer' => $links->where('is_active', true)->where('show_in_footer', true)->count(),
        ];

        return Inertia::render('dashboard/social-links/index', [
            'links' => $links,
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created social link.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'platform' => ['required', 'string', 'max:50'],
            'title' => ['required', 'string', 'max:100'],
            'url' => ['required', 'string', 'max:500'],
            'icon' => ['nullable', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'max:30'],
            'is_active' => ['boolean'],
            'show_in_header' => ['boolean'],
            'show_in_footer' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        SocialLink::create([
            'platform' => strtolower(trim($validated['platform'])),
            'title' => trim($validated['title']),
            'url' => trim($validated['url']),
            'icon' => !empty($validated['icon']) ? trim($validated['icon']) : strtolower(trim($validated['platform'])),
            'color' => !empty($validated['color']) ? trim($validated['color']) : null,
            'is_active' => $validated['is_active'] ?? true,
            'show_in_header' => $validated['show_in_header'] ?? true,
            'show_in_footer' => $validated['show_in_footer'] ?? true,
            'sort_order' => $validated['sort_order'] ?? (SocialLink::max('sort_order') + 1),
        ]);

        return redirect()->back()->with('success', 'Social media link added successfully.');
    }

    /**
     * Update the specified social link.
     */
    public function update(Request $request, SocialLink $socialLink): RedirectResponse
    {
        $validated = $request->validate([
            'platform' => ['required', 'string', 'max:50'],
            'title' => ['required', 'string', 'max:100'],
            'url' => ['required', 'string', 'max:500'],
            'icon' => ['nullable', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'max:30'],
            'is_active' => ['boolean'],
            'show_in_header' => ['boolean'],
            'show_in_footer' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $socialLink->update([
            'platform' => strtolower(trim($validated['platform'])),
            'title' => trim($validated['title']),
            'url' => trim($validated['url']),
            'icon' => !empty($validated['icon']) ? trim($validated['icon']) : strtolower(trim($validated['platform'])),
            'color' => !empty($validated['color']) ? trim($validated['color']) : null,
            'is_active' => $validated['is_active'] ?? $socialLink->is_active,
            'show_in_header' => $validated['show_in_header'] ?? $socialLink->show_in_header,
            'show_in_footer' => $validated['show_in_footer'] ?? $socialLink->show_in_footer,
            'sort_order' => $validated['sort_order'] ?? $socialLink->sort_order,
        ]);

        return redirect()->back()->with('success', 'Social media link updated successfully.');
    }

    /**
     * Remove the specified social link.
     */
    public function destroy(SocialLink $socialLink): RedirectResponse
    {
        $socialLink->delete();

        return redirect()->back()->with('success', 'Social media link deleted successfully.');
    }

    /**
     * Quick toggle for status or visibility.
     */
    public function toggle(Request $request, SocialLink $socialLink): RedirectResponse
    {
        $validated = $request->validate([
            'field' => ['required', 'in:is_active,show_in_header,show_in_footer'],
        ]);

        $field = $validated['field'];
        $socialLink->update([
            $field => ! $socialLink->{$field},
        ]);

        return redirect()->back()->with('success', 'Status updated.');
    }

    /**
     * Reorder social links.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'orders' => ['required', 'array'],
            'orders.*.id' => ['required', 'exists:social_links,id'],
            'orders.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['orders'] as $item) {
            SocialLink::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        \Illuminate\Support\Facades\Cache::forget(SocialLink::CACHE_KEY);

        return redirect()->back()->with('success', 'Order updated successfully.');
    }
}
