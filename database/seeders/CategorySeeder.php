<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'এয়ারবাডস',
                'slug' => 'airbuds',
                'description' => 'ওয়্যারলেস এয়ারবাডস ও ইয়ারফোন',
                'image' => null,
                'sort_order' => 1,
            ],
            [
                'name' => 'হেডফোন',
                'slug' => 'headphone',
                'description' => 'ওভার-ইয়ার ও অন-ইয়ার হেডফোন',
                'image' => null,
                'sort_order' => 2,
            ],
            [
                'name' => 'ট্রিমার',
                'slug' => 'trimmer',
                'description' => 'শেভিং মেশিন ও হেয়ার ট্রিমার',
                'image' => null,
                'sort_order' => 3,
            ],
            [
                'name' => 'স্মার্ট ওয়াচ',
                'slug' => 'smart-watch',
                'description' => 'স্মার্টওয়াচ ও ফিটনেস ব্যান্ড',
                'image' => null,
                'sort_order' => 4,
            ],
            [
                'name' => 'স্পিকার',
                'slug' => 'speaker',
                'description' => 'ব্লুটুথ ও পোর্টেবল স্পিকার',
                'image' => null,
                'sort_order' => 5,
            ],
            [
                'name' => 'চার্জার ও ক্যাবল',
                'slug' => 'charger-cable',
                'description' => 'ফাস্ট চার্জার, পাওয়ার ব্যাংক ও ক্যাবল',
                'image' => null,
                'sort_order' => 6,
            ],
            [
                'name' => 'ফোন কেস',
                'slug' => 'phone-case',
                'description' => 'মোবাইল কভার ও প্রটেক্টর',
                'image' => null,
                'sort_order' => 7,
            ],
            [
                'name' => 'অন্যান্য',
                'slug' => 'others',
                'description' => 'অন্যান্য গ্যাজেট ও আনুষঙ্গিক',
                'image' => null,
                'sort_order' => 8,
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
