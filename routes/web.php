<?php

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\Customer\AccountController;
use App\Http\Controllers\Dashboard\CategoryController;
use App\Http\Controllers\Dashboard\CouponController;
use App\Http\Controllers\Dashboard\CustomerController as DashboardCustomerController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\OrderController as DashboardOrderController;
use App\Http\Controllers\Dashboard\ProductController as DashboardProductController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ShopController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

// ─── Storefront Routes ────────────────────────────────────────────────────────
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/shop', [ShopController::class, 'index'])->name('shop');
Route::get('/product/{slug}', [ProductController::class, 'show'])->name('product.show');
Route::get('/cart', [PageController::class, 'cart'])->name('cart');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');
Route::get('/privacy-policy', [PageController::class, 'privacyPolicy'])->name('privacy-policy');
Route::get('/return-policy', [PageController::class, 'returnPolicy'])->name('return-policy');
Route::get('/terms', [PageController::class, 'terms'])->name('terms');

// ─── Customer Account Routes ──────────────────────────────────────────────────
Route::middleware(['auth'])->prefix('account')->name('account.')->group(function () {
    Route::get('/', [AccountController::class, 'index'])->name('index');
    Route::patch('/profile', [AccountController::class, 'updateProfile'])->name('profile.update');
    Route::put('/password', [AccountController::class, 'updatePassword'])->name('password.update');
});

// ─── Checkout Routes ──────────────────────────────────────────────────────────
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::post('/checkout/apply-coupon', [CheckoutController::class, 'applyCoupon'])->name('checkout.coupon');
Route::get('/order/success/{order}', [CheckoutController::class, 'success'])->name('order.success');

// ─── Admin Dashboard Routes ───────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['auth', 'verified', EnsureUserIsAdmin::class])->prefix('dashboard')->name('dashboard.')->group(function () {

    // Products
    Route::get('/products', [DashboardProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [DashboardProductController::class, 'create'])->name('products.create');
    Route::post('/products', [DashboardProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product}/edit', [DashboardProductController::class, 'edit'])->name('products.edit');
    Route::post('/products/{product}', [DashboardProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [DashboardProductController::class, 'destroy'])->name('products.destroy');

    // Categories
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::post('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Orders
    Route::get('/orders', [DashboardOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [DashboardOrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order}/status', [DashboardOrderController::class, 'updateStatus'])->name('orders.status');
    Route::delete('/orders/{order}', [DashboardOrderController::class, 'destroy'])->name('orders.destroy');

    // Coupons
    Route::get('/coupons', [CouponController::class, 'index'])->name('coupons.index');
    Route::post('/coupons', [CouponController::class, 'store'])->name('coupons.store');
    Route::post('/coupons/{coupon}', [CouponController::class, 'update'])->name('coupons.update');
    Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy'])->name('coupons.destroy');

    // Media Library (WordPress Style)
    Route::get('/media', [\App\Http\Controllers\Dashboard\MediaController::class, 'index'])->name('media.index');
    Route::get('/media/list', [\App\Http\Controllers\Dashboard\MediaController::class, 'apiList'])->name('media.list');
    Route::post('/media', [\App\Http\Controllers\Dashboard\MediaController::class, 'store'])->name('media.store');
    Route::delete('/media/{media}', [\App\Http\Controllers\Dashboard\MediaController::class, 'destroy'])->name('media.destroy');

    // Customers
    Route::get('/customers', [DashboardCustomerController::class, 'index'])->name('customers.index');

    // Hero Section / Banner & Slider Manager
    Route::get('/hero', [\App\Http\Controllers\Dashboard\HeroController::class, 'index'])->name('hero.index');
    Route::post('/hero/settings', [\App\Http\Controllers\Dashboard\HeroController::class, 'updateSettings'])->name('hero.settings');
    Route::post('/hero/slides', [\App\Http\Controllers\Dashboard\HeroController::class, 'storeSlide'])->name('hero.slides.store');
    Route::post('/hero/slides/{slide}', [\App\Http\Controllers\Dashboard\HeroController::class, 'updateSlide'])->name('hero.slides.update');
    Route::delete('/hero/slides/{slide}', [\App\Http\Controllers\Dashboard\HeroController::class, 'destroySlide'])->name('hero.slides.destroy');
    Route::post('/hero/reorder', [\App\Http\Controllers\Dashboard\HeroController::class, 'reorderSlides'])->name('hero.reorder');
    Route::patch('/hero/slides/{slide}/toggle', [\App\Http\Controllers\Dashboard\HeroController::class, 'toggleStatus'])->name('hero.slides.toggle');

    // Code Snippets (Custom Header, Body, Footer Tracking & Scripts)
    Route::get('/snippets', [\App\Http\Controllers\Dashboard\CodeSnippetController::class, 'index'])->name('snippets.index');
    Route::post('/snippets', [\App\Http\Controllers\Dashboard\CodeSnippetController::class, 'store'])->name('snippets.store');
    Route::put('/snippets/{snippet}', [\App\Http\Controllers\Dashboard\CodeSnippetController::class, 'update'])->name('snippets.update');
    Route::delete('/snippets/{snippet}', [\App\Http\Controllers\Dashboard\CodeSnippetController::class, 'destroy'])->name('snippets.destroy');
    Route::patch('/snippets/{snippet}/toggle', [\App\Http\Controllers\Dashboard\CodeSnippetController::class, 'toggle'])->name('snippets.toggle');

    // Social Links (Header & Footer Social Media Management)
    Route::get('/social-links', [\App\Http\Controllers\Dashboard\SocialLinkController::class, 'index'])->name('social-links.index');
    Route::post('/social-links', [\App\Http\Controllers\Dashboard\SocialLinkController::class, 'store'])->name('social-links.store');
    Route::put('/social-links/{socialLink}', [\App\Http\Controllers\Dashboard\SocialLinkController::class, 'update'])->name('social-links.update');
    Route::delete('/social-links/{socialLink}', [\App\Http\Controllers\Dashboard\SocialLinkController::class, 'destroy'])->name('social-links.destroy');
    Route::patch('/social-links/{socialLink}/toggle', [\App\Http\Controllers\Dashboard\SocialLinkController::class, 'toggle'])->name('social-links.toggle');
    Route::post('/social-links/reorder', [\App\Http\Controllers\Dashboard\SocialLinkController::class, 'reorder'])->name('social-links.reorder');
});

require __DIR__ . '/settings.php';
