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
        ]);

        SiteSetting::set('site_title', $request->site_title);
        SiteSetting::set('site_tagline', $request->site_tagline ?? '');

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

    public function payment(): Response
    {
        $gateways = [
            'cod' => [
                'enabled' => SiteSetting::get('payment_cod_enabled', '1') === '1',
                'title' => SiteSetting::get('payment_cod_title', 'Cash on Delivery (ক্যাশ অন ডেলিভারি)'),
                'instructions' => SiteSetting::get('payment_cod_instructions', 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।'),
            ],
            'uddoktapay' => [
                'enabled' => SiteSetting::get('payment_uddoktapay_enabled', '0') === '1',
                'api_key' => SiteSetting::get('payment_uddoktapay_api_key', ''),
                'base_url' => SiteSetting::get('payment_uddoktapay_base_url', 'https://checkout.uddoktapay.com/api/checkout-v2'),
                'mode' => SiteSetting::get('payment_uddoktapay_mode', 'live'),
                'title' => SiteSetting::get('payment_uddoktapay_title', 'Online Payment (bKash / Nagad / Rocket / Cards)'),
            ],
            'bkash' => [
                'enabled' => SiteSetting::get('payment_bkash_enabled', '0') === '1',
                'app_key' => SiteSetting::get('payment_bkash_app_key', ''),
                'app_secret' => SiteSetting::get('payment_bkash_app_secret', ''),
                'username' => SiteSetting::get('payment_bkash_username', ''),
                'password' => SiteSetting::get('payment_bkash_password', ''),
                'mode' => SiteSetting::get('payment_bkash_mode', 'sandbox'),
            ],
            'nagad' => [
                'enabled' => SiteSetting::get('payment_nagad_enabled', '0') === '1',
                'merchant_id' => SiteSetting::get('payment_nagad_merchant_id', ''),
                'public_key' => SiteSetting::get('payment_nagad_public_key', ''),
                'private_key' => SiteSetting::get('payment_nagad_private_key', ''),
                'mode' => SiteSetting::get('payment_nagad_mode', 'sandbox'),
            ],
            'sslcommerz' => [
                'enabled' => SiteSetting::get('payment_sslcz_enabled', '0') === '1',
                'store_id' => SiteSetting::get('payment_sslcz_store_id', ''),
                'store_password' => SiteSetting::get('payment_sslcz_store_password', ''),
                'mode' => SiteSetting::get('payment_sslcz_mode', 'sandbox'),
            ],
        ];

        return Inertia::render('dashboard/settings/payment', [
            'gateways' => $gateways,
        ]);
    }

    public function updatePayment(Request $request): RedirectResponse
    {
        $data = $request->validate([
            // COD
            'cod.enabled' => 'boolean',
            'cod.title' => 'nullable|string|max:150',
            'cod.instructions' => 'nullable|string|max:500',

            // UddoktaPay
            'uddoktapay.enabled' => 'boolean',
            'uddoktapay.api_key' => 'nullable|string|max:255',
            'uddoktapay.base_url' => 'nullable|string|max:255',
            'uddoktapay.mode' => 'nullable|string|in:sandbox,live',
            'uddoktapay.title' => 'nullable|string|max:150',

            // bKash
            'bkash.enabled' => 'boolean',
            'bkash.app_key' => 'nullable|string|max:255',
            'bkash.app_secret' => 'nullable|string|max:255',
            'bkash.username' => 'nullable|string|max:255',
            'bkash.password' => 'nullable|string|max:255',
            'bkash.mode' => 'nullable|string|in:sandbox,live',

            // Nagad
            'nagad.enabled' => 'boolean',
            'nagad.merchant_id' => 'nullable|string|max:255',
            'nagad.public_key' => 'nullable|string',
            'nagad.private_key' => 'nullable|string',
            'nagad.mode' => 'nullable|string|in:sandbox,live',

            // SSLCommerz
            'sslcommerz.enabled' => 'boolean',
            'sslcommerz.store_id' => 'nullable|string|max:255',
            'sslcommerz.store_password' => 'nullable|string|max:255',
            'sslcommerz.mode' => 'nullable|string|in:sandbox,live',
        ]);

        // Save COD
        SiteSetting::set('payment_cod_enabled', !empty($data['cod']['enabled']) ? '1' : '0');
        SiteSetting::set('payment_cod_title', $data['cod']['title'] ?? 'Cash on Delivery (ক্যাশ অন ডেলিভারি)');
        SiteSetting::set('payment_cod_instructions', $data['cod']['instructions'] ?? 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।');

        // Save UddoktaPay
        SiteSetting::set('payment_uddoktapay_enabled', !empty($data['uddoktapay']['enabled']) ? '1' : '0');
        SiteSetting::set('payment_uddoktapay_api_key', $data['uddoktapay']['api_key'] ?? '');
        SiteSetting::set('payment_uddoktapay_base_url', $data['uddoktapay']['base_url'] ?? 'https://checkout.uddoktapay.com/api/checkout-v2');
        SiteSetting::set('payment_uddoktapay_mode', $data['uddoktapay']['mode'] ?? 'live');
        SiteSetting::set('payment_uddoktapay_title', $data['uddoktapay']['title'] ?? 'Online Payment (bKash / Nagad / Rocket / Cards)');

        // Save bKash
        SiteSetting::set('payment_bkash_enabled', !empty($data['bkash']['enabled']) ? '1' : '0');
        SiteSetting::set('payment_bkash_app_key', $data['bkash']['app_key'] ?? '');
        SiteSetting::set('payment_bkash_app_secret', $data['bkash']['app_secret'] ?? '');
        SiteSetting::set('payment_bkash_username', $data['bkash']['username'] ?? '');
        SiteSetting::set('payment_bkash_password', $data['bkash']['password'] ?? '');
        SiteSetting::set('payment_bkash_mode', $data['bkash']['mode'] ?? 'sandbox');

        // Save Nagad
        SiteSetting::set('payment_nagad_enabled', !empty($data['nagad']['enabled']) ? '1' : '0');
        SiteSetting::set('payment_nagad_merchant_id', $data['nagad']['merchant_id'] ?? '');
        SiteSetting::set('payment_nagad_public_key', $data['nagad']['public_key'] ?? '');
        SiteSetting::set('payment_nagad_private_key', $data['nagad']['private_key'] ?? '');
        SiteSetting::set('payment_nagad_mode', $data['nagad']['mode'] ?? 'sandbox');

        // Save SSLCommerz
        SiteSetting::set('payment_sslcz_enabled', !empty($data['sslcommerz']['enabled']) ? '1' : '0');
        SiteSetting::set('payment_sslcz_store_id', $data['sslcommerz']['store_id'] ?? '');
        SiteSetting::set('payment_sslcz_store_password', $data['sslcommerz']['store_password'] ?? '');
        SiteSetting::set('payment_sslcz_mode', $data['sslcommerz']['mode'] ?? 'sandbox');

        return back()->with('success', 'পেমেন্ট গেটওয়ে সেটিংস সফলভাবে আপডেট হয়েছে।');
    }

    public function courier(): Response
    {
        $couriers = [
            'steadfast' => [
                'enabled' => SiteSetting::get('courier_steadfast_enabled', '0') === '1',
                'api_key' => SiteSetting::get('courier_steadfast_api_key', ''),
                'secret_key' => SiteSetting::get('courier_steadfast_secret_key', ''),
                'base_url' => SiteSetting::get('courier_steadfast_base_url', 'https://portal.packzy.com/api/v1'),
                'delivery_note' => SiteSetting::get('courier_steadfast_delivery_note', 'Handle with care'),
            ],
            'pathao' => [
                'enabled' => SiteSetting::get('courier_pathao_enabled', '0') === '1',
                'client_id' => SiteSetting::get('courier_pathao_client_id', ''),
                'client_secret' => SiteSetting::get('courier_pathao_client_secret', ''),
                'username' => SiteSetting::get('courier_pathao_username', ''),
                'password' => SiteSetting::get('courier_pathao_password', ''),
                'store_id' => SiteSetting::get('courier_pathao_store_id', ''),
                'base_url' => SiteSetting::get('courier_pathao_base_url', 'https://api-hermes.pathao.com'),
                'mode' => SiteSetting::get('courier_pathao_mode', 'sandbox'),
            ],
        ];

        return Inertia::render('dashboard/settings/courier', [
            'couriers' => $couriers,
        ]);
    }

    public function updateCourier(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'steadfast.enabled' => 'nullable|boolean',
            'steadfast.api_key' => 'nullable|string|max:255',
            'steadfast.secret_key' => 'nullable|string|max:255',
            'steadfast.base_url' => 'nullable|string|max:255',
            'steadfast.delivery_note' => 'nullable|string|max:255',

            'pathao.enabled' => 'nullable|boolean',
            'pathao.client_id' => 'nullable|string|max:255',
            'pathao.client_secret' => 'nullable|string|max:255',
            'pathao.username' => 'nullable|string|max:255',
            'pathao.password' => 'nullable|string|max:255',
            'pathao.store_id' => 'nullable|string|max:255',
            'pathao.base_url' => 'nullable|string|max:255',
            'pathao.mode' => 'nullable|string|in:sandbox,live',
        ]);

        // Save Steadfast
        SiteSetting::set('courier_steadfast_enabled', !empty($data['steadfast']['enabled']) ? '1' : '0');
        SiteSetting::set('courier_steadfast_api_key', $data['steadfast']['api_key'] ?? '');
        SiteSetting::set('courier_steadfast_secret_key', $data['steadfast']['secret_key'] ?? '');
        SiteSetting::set('courier_steadfast_base_url', $data['steadfast']['base_url'] ?? 'https://portal.packzy.com/api/v1');
        SiteSetting::set('courier_steadfast_delivery_note', $data['steadfast']['delivery_note'] ?? 'Handle with care');

        // Save Pathao
        SiteSetting::set('courier_pathao_enabled', !empty($data['pathao']['enabled']) ? '1' : '0');
        SiteSetting::set('courier_pathao_client_id', $data['pathao']['client_id'] ?? '');
        SiteSetting::set('courier_pathao_client_secret', $data['pathao']['client_secret'] ?? '');
        SiteSetting::set('courier_pathao_username', $data['pathao']['username'] ?? '');
        SiteSetting::set('courier_pathao_password', $data['pathao']['password'] ?? '');
        SiteSetting::set('courier_pathao_store_id', $data['pathao']['store_id'] ?? '');
        SiteSetting::set('courier_pathao_base_url', $data['pathao']['base_url'] ?? 'https://api-hermes.pathao.com');
        SiteSetting::set('courier_pathao_mode', $data['pathao']['mode'] ?? 'sandbox');

        return back()->with('success', 'কুরিয়ার সার্ভিস সেটিংস সফলভাবে আপডেট হয়েছে।');
    }
}
