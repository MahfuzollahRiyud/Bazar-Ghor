<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::pluck('id', 'slug');

        $products = [
            // Airbuds
            [
                'category_slug' => 'airbuds',
                'name' => 'TWS Pro X5 ওয়্যারলেস এয়ারবাডস',
                'short_description' => 'ব্লুটুথ ৫.৩ সহ ৪৮ ঘণ্টা ব্যাটারি লাইফ, নয়েজ ক্যান্সেলেশন',
                'description' => '<p>TWS Pro X5 হলো একটি প্রিমিয়াম মানের ওয়্যারলেস এয়ারবাডস। এটিতে রয়েছে অত্যাধুনিক ব্লুটুথ ৫.৩ প্রযুক্তি, যা আপনাকে নিরবচ্ছিন্ন সংযোগ দেবে। চার্জিং কেসটি ৪৮ ঘণ্টার মোট ব্যাটারি ব্যাকআপ সরবরাহ করে।</p>',
                'price' => 1299,
                'sale_price' => 999,
                'stock_quantity' => 50,
                'is_featured' => true,
                'thumbnail' => 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=500',
                'has_variants' => true,
                'variants' => [
                    ['name' => 'কালো', 'options' => [['name' => 'রং', 'value' => 'কালো']], 'price' => 999, 'stock_quantity' => 25],
                    ['name' => 'সাদা', 'options' => [['name' => 'রং', 'value' => 'সাদা']], 'price' => 999, 'stock_quantity' => 25],
                ],
            ],
            [
                'category_slug' => 'airbuds',
                'name' => 'i7s TWS মিনি ব্লুটুথ ইয়ারবাড',
                'short_description' => 'ব্লুটুথ ৫.০, টাচ কন্ট্রোল, মিনি ডিজাইন',
                'description' => '<p>i7s TWS মিনি ইয়ারবাড আপনার দৈনন্দিন জীবনের সঙ্গী। এটি ব্লুটুথ ৫.০ প্রযুক্তিতে কাজ করে এবং টাচ কন্ট্রোল সুবিধা দেয়।</p>',
                'price' => 599,
                'sale_price' => null,
                'stock_quantity' => 80,
                'is_featured' => true,
                'thumbnail' => 'https://images.unsplash.com/photo-1606400082777-ef05f3c5cde2?w=500',
                'has_variants' => false,
            ],

            // Headphone
            [
                'category_slug' => 'headphone',
                'name' => 'Borofone BO20 ওয়্যারলেস হেডফোন',
                'short_description' => 'ব্লুটুথ ৫.০, ৩০ ঘণ্টা প্লেব্যাক, ফোল্ডেবল ডিজাইন',
                'description' => '<p>Borofone BO20 একটি উচ্চমানের ওভার-ইয়ার হেডফোন যা ব্লুটুথ ৫.০ প্রযুক্তিতে ৩০ ঘণ্টার প্লেব্যাক দেয়। ফোল্ডেবল ডিজাইনে বহন করা সহজ।</p>',
                'price' => 1899,
                'sale_price' => 1499,
                'stock_quantity' => 30,
                'is_featured' => true,
                'thumbnail' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
                'has_variants' => true,
                'variants' => [
                    ['name' => 'কালো', 'options' => [['name' => 'রং', 'value' => 'কালো']], 'price' => 1499, 'stock_quantity' => 15],
                    ['name' => 'লাল', 'options' => [['name' => 'রং', 'value' => 'লাল']], 'price' => 1499, 'stock_quantity' => 15],
                ],
            ],
            [
                'category_slug' => 'headphone',
                'name' => 'Hoco W35 গেমিং হেডসেট',
                'short_description' => 'RGB লাইট, সার্রাউন্ড সাউন্ড, মাইক্রোফোন সহ',
                'description' => '<p>Hoco W35 গেমিং হেডসেট RGB লাইটিং এবং সার্রাউন্ড সাউন্ড সহ আসে। এতে বিল্ট-ইন মাইক্রোফোন রয়েছে যা গেমিং কমিউনিকেশনকে সহজ করে।</p>',
                'price' => 1299,
                'sale_price' => null,
                'stock_quantity' => 25,
                'is_featured' => false,
                'thumbnail' => 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500',
                'has_variants' => false,
            ],

            // Trimmer
            [
                'category_slug' => 'trimmer',
                'name' => 'Kemei KM-600 প্রফেশনাল ট্রিমার',
                'short_description' => 'USB চার্জিং, ৬০ মিনিট রানটাইম, ওয়াটারপ্রুফ',
                'description' => '<p>Kemei KM-600 একটি প্রফেশনাল মানের ট্রিমার। USB-C চার্জিং দিয়ে ৬০ মিনিটের রানটাইম পাওয়া যায়। এটি IPX6 ওয়াটারপ্রুফ তাই ধোয়া সহজ।</p>',
                'price' => 999,
                'sale_price' => 799,
                'stock_quantity' => 40,
                'is_featured' => true,
                'thumbnail' => 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=500',
                'has_variants' => false,
            ],
            [
                'category_slug' => 'trimmer',
                'name' => 'Xiaomi Mijia Electric Shaver',
                'short_description' => '৩ ব্লেড, ৪৫ মিনিট ব্যাটারি, ওয়েট ও ড্রাই উভয়',
                'description' => '<p>Xiaomi Mijia Electric Shaver ৩ ব্লেড ডিজাইন সহ আসে। ওয়েট ও ড্রাই উভয়ভাবে ব্যবহার করা যায়। ৪৫ মিনিটের ব্যাটারি ব্যাকআপ সরবরাহ করে।</p>',
                'price' => 1499,
                'sale_price' => null,
                'stock_quantity' => 20,
                'is_featured' => false,
                'thumbnail' => 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500',
                'has_variants' => false,
            ],

            // Smart Watch
            [
                'category_slug' => 'smart-watch',
                'name' => 'HW22 Pro স্মার্টওয়াচ',
                'short_description' => '১.৭৫" ডিসপ্লে, হার্টরেট মনিটর, মাল্টিপল স্পোর্টস মোড',
                'description' => '<p>HW22 Pro স্মার্টওয়াচে রয়েছে ১.৭৫ ইঞ্চির বড় ডিসপ্লে। হার্টরেট, ব্লাড অক্সিজেন মনিটর সহ ১০টি স্পোর্টস মোড আছে।</p>',
                'price' => 1799,
                'sale_price' => 1399,
                'stock_quantity' => 35,
                'is_featured' => true,
                'thumbnail' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
                'has_variants' => true,
                'variants' => [
                    ['name' => 'কালো স্ট্র্যাপ', 'options' => [['name' => 'স্ট্র্যাপ', 'value' => 'কালো']], 'price' => 1399, 'stock_quantity' => 20],
                    ['name' => 'সবুজ স্ট্র্যাপ', 'options' => [['name' => 'স্ট্র্যাপ', 'value' => 'সবুজ']], 'price' => 1399, 'stock_quantity' => 15],
                ],
            ],

            // Speaker
            [
                'category_slug' => 'speaker',
                'name' => 'JBL Style পোর্টেবল ব্লুটুথ স্পিকার',
                'short_description' => '১০W আউটপুট, ওয়াটারপ্রুফ, ১০ ঘণ্টা প্লেব্যাক',
                'description' => '<p>JBL Style পোর্টেবল ব্লুটুথ স্পিকার ১০ ওয়াট আউটপুট সহ আসে। IPX5 ওয়াটারপ্রুফ এবং ১০ ঘণ্টার ব্যাটারি ব্যাকআপ দেয়।</p>',
                'price' => 1199,
                'sale_price' => 899,
                'stock_quantity' => 20,
                'is_featured' => true,
                'thumbnail' => 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
                'has_variants' => false,
            ],

            // Charger & Cable
            [
                'category_slug' => 'charger-cable',
                'name' => '65W GaN ফাস্ট চার্জার',
                'short_description' => 'USB-C PD ৬৫W, ল্যাপটপ ও ফোন উভয় চার্জ করুন',
                'description' => '<p>৬৫ওয়াট GaN প্রযুক্তির এই চার্জারটি ফোন থেকে শুরু করে ল্যাপটপ পর্যন্ত সব ডিভাইস দ্রুত চার্জ করতে পারে।</p>',
                'price' => 899,
                'sale_price' => 699,
                'stock_quantity' => 60,
                'is_featured' => false,
                'thumbnail' => 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500',
                'has_variants' => false,
            ],
        ];

        foreach ($products as $data) {
            $categoryId = $categories[$data['category_slug']] ?? null;
            if (!$categoryId) continue;

            $variants = $data['variants'] ?? [];
            unset($data['category_slug'], $data['variants']);

            $slug = Str::slug($data['name']) . '-' . Str::random(5);

            $product = Product::firstOrCreate(
                ['slug' => $slug],
                array_merge($data, [
                    'category_id' => $categoryId,
                    'slug' => $slug,
                ])
            );

            if ($data['has_variants'] && count($variants)) {
                foreach ($variants as $variant) {
                    ProductVariant::firstOrCreate(
                        ['product_id' => $product->id, 'name' => $variant['name']],
                        array_merge($variant, ['product_id' => $product->id, 'is_active' => true])
                    );
                }
            }
        }
    }
}
