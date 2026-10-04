<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'socialLinks' => fn () => \App\Models\SocialLink::getActiveCached(),
            'siteSettings' => fn () => [
                'site_title' => \App\Models\SiteSetting::get('site_title', 'Bazar Ghor'),
                'site_tagline' => \App\Models\SiteSetting::get('site_tagline', 'স্মার্ট গ্যাজেট স্টোর'),
                'site_logo_url' => \App\Models\SiteSetting::get('site_logo')
                    ? (str_starts_with(\App\Models\SiteSetting::get('site_logo'), 'http')
                        ? \App\Models\SiteSetting::get('site_logo')
                        : asset('storage/' . \App\Models\SiteSetting::get('site_logo')))
                    : '/images/logo.png',
                'site_favicon_url' => \App\Models\SiteSetting::get('site_favicon')
                    ? (str_starts_with(\App\Models\SiteSetting::get('site_favicon'), 'http')
                        ? \App\Models\SiteSetting::get('site_favicon')
                        : asset('storage/' . \App\Models\SiteSetting::get('site_favicon')))
                    : '/favicon.ico',
            ],
        ];
    }
}
