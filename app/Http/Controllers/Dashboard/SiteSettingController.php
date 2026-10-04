<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Services\ImageOptimizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiteSettingController extends Controller
{
    public function index(): Response
    {
        $settings = [
            'site_title' => SiteSetting::get('site_title', 'Bazar Ghor'),
            'site_tagline' => SiteSetting::get('site_tagline', 'স্মার্ট গ্যাজেট স্টোর'),
            'site_logo' => SiteSetting::get('site_logo'),
            'site_logo_url' => SiteSetting::get('site_logo') ? asset('storage/' . SiteSetting::get('site_logo')) : '/images/logo.png',
            'site_favicon' => SiteSetting::get('site_favicon'),
            'site_favicon_url' => SiteSetting::get('site_favicon') ? asset('storage/' . SiteSetting::get('site_favicon')) : '/favicon.ico',
            'marketing_cost' => (float) SiteSetting::get('marketing_cost', '0'),
        ];

        return Inertia::render('dashboard/settings/general', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'site_title' => 'required|string|max:100',
            'site_tagline' => 'nullable|string|max:150',
            'logo' => 'nullable|image|max:5120',
            'media_logo_path' => 'nullable|string',
            'favicon' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,ico,webp|max:2048',
            'media_favicon_path' => 'nullable|string',
            'marketing_cost' => 'nullable|numeric|min:0',
        ]);

        SiteSetting::set('site_title', $request->site_title);
        SiteSetting::set('site_tagline', $request->site_tagline ?? '');

        if ($request->has('marketing_cost')) {
            SiteSetting::set('marketing_cost', (string) $request->marketing_cost);
        }

        // Handle Logo
        if ($request->filled('media_logo_path')) {
            SiteSetting::set('site_logo', $request->media_logo_path);
        } elseif ($request->hasFile('logo')) {
            $path = ImageOptimizer::optimizeAndStoreWebp($request->file('logo'), 'settings');
            SiteSetting::set('site_logo', $path);
        }

        // Handle Favicon
        if ($request->filled('media_favicon_path')) {
            SiteSetting::set('site_favicon', $request->media_favicon_path);
        } elseif ($request->hasFile('favicon')) {
            $path = ImageOptimizer::optimizeAndStoreWebp($request->file('favicon'), 'settings');
            SiteSetting::set('site_favicon', $path);
        }

        return back()->with('success', 'ওয়েবসাইট সেটিংস সফলভাবে আপডেট হয়েছে।');
    }
}
