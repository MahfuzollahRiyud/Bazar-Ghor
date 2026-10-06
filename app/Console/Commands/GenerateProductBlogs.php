<?php

namespace App\Console\Commands;

use App\Models\BlogPost;
use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateProductBlogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'blog:generate-products {--force : Overwrite existing blog posts for products}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $signature_description = 'Generate rich, SEO-optimized blog posts for each product';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting automated SEO blog generation for all products...');

        $products = Product::with(['category', 'categories'])->get();
        $this->info("Found {$products->count()} products in store.");

        $createdCount = 0;
        $updatedCount = 0;

        foreach ($products as $product) {
            $categoryName = $product->category?->name ?? 'গ্যাজেট ও ইলেকট্রনিক্স';
            
            // Clean up category name if needed
            if (empty($categoryName) || str_contains($categoryName, '???')) {
                $categoryName = $this->inferCategory($product->name);
            }

            // Sanitize product name to remove any ??? encoding artifacts
            $cleanName = str_replace('???', '-', (string) $product->name);
            $cleanName = preg_replace('/\s+-\s+/', ' - ', $cleanName);
            $cleanName = trim(preg_replace('/\s+/', ' ', $cleanName));

            $productUrl = "/product/{$product->slug}";
            $priceText = '৳' . number_format((float) ($product->sale_price ?: $product->price));
            $oldPriceText = $product->sale_price ? '৳' . number_format((float) $product->price) : null;

            // Generate customized SEO Title
            $title = $this->generateSeoTitle($cleanName, $categoryName);
            $slug = Str::slug($cleanName . '-review-price-bd');

            // High-converting Excerpt
            $excerpt = "{$cleanName} এর দাম, বিস্তারিত রিভিউ এবং স্পেসিফিকেশন। মাত্র {$priceText} টাকায় বাজার ঘর থেকে অরিজিনাল প্রোডাক্ট কিনুন ক্যাশ অন ডেলিভারিতে।";

            // SEO Keywords & Tags
            $tags = $this->generateTags($cleanName, $categoryName);

            // Generate Rich HTML Content
            $content = $this->generateBlogContent($product, $cleanName, $categoryName, $priceText, $oldPriceText, $productUrl);

            // Meta Title & Description for Google SEO
            $metaTitle = "{$cleanName} দাম ও রিভিউ ২০২৬ | Bazar Ghor";
            if (mb_strlen($metaTitle) > 60) {
                $metaTitle = mb_substr($metaTitle, 0, 57) . '...';
            }
            $metaDescription = "বাংলাদেশে {$cleanName} এর বর্তমান দাম {$priceText} টাকা। সেরা কোয়ালিটি, ১০০% অরিজিনাল ও দ্রুততম ক্যাশ অন ডেলিভারিতে অর্ডার করতে এখনই ভিজিট করুন বাজার ঘর।";

            $existing = BlogPost::where('slug', $slug)
                ->orWhere('title', $title)
                ->first();

            $data = [
                'title' => $title,
                'slug' => $slug,
                'category' => $categoryName,
                'featured_image' => $product->thumbnail,
                'excerpt' => $excerpt,
                'content' => $content,
                'author_name' => 'বাজার ঘর টিম',
                'is_published' => true,
                'published_at' => now()->subHours(rand(1, 72)),
                'views_count' => rand(180, 850),
                'meta_title' => $metaTitle,
                'meta_description' => $metaDescription,
                'tags' => $tags,
            ];

            if ($existing) {
                $existing->update($data);
                $updatedCount++;
                $this->line("✔ Updated blog: {$title}");
            } else {
                BlogPost::create($data);
                $createdCount++;
                $this->line("✔ Created blog: {$title}");
            }
        }

        $this->info("Completed! Created: {$createdCount}, Updated: {$updatedCount}. Total blogs now: " . BlogPost::count());

        return Command::SUCCESS;
    }

    private function inferCategory(string $name): string
    {
        $lower = strtolower($name);
        if (str_contains($lower, 'watch')) return 'স্মার্ট ওয়াচ';
        if (str_contains($lower, 'earphone') || str_contains($lower, 'airpods') || str_contains($lower, 'earbuds')) return 'ইয়ারবাডস ও অডিও';
        if (str_contains($lower, 'neckband') || str_contains($lower, 'headphones')) return 'নেকব্যান্ড ও হেডফোন';
        if (str_contains($lower, 'multiplug') || str_contains($lower, 'socket')) return 'মাল্টিপ্লাগ ও ইলেকট্রিক্যাল';
        if (str_contains($lower, 'tripod') || str_contains($lower, 'selfie')) return 'ট্রাইপড ও সেলফি স্টিক';
        if (str_contains($lower, 'microphone') || str_contains($lower, 'mic')) return 'মাইক্রোফোন';
        if (str_contains($lower, 'kettle')) return 'ইলেকট্রিক কেটলি';
        if (str_contains($lower, 'ups')) return 'মিনি ইউপিএস';
        if (str_contains($lower, 'stand') || str_contains($lower, 'holder')) return 'মোবাইল এক্সেসরিজ';
        return 'গ্যাজেট ও লাইফস্টাইল';
    }

    private function generateSeoTitle(string $productName, string $category): string
    {
        $cleanName = preg_replace('/[^\w\s\-\+\(\)\.]+/u', '', $productName);
        $cleanName = trim(preg_replace('/\s+/', ' ', $cleanName));

        $templates = [
            "{$cleanName} রিভিউ ও বর্তমান দাম ২০২৬ - কেন এটি সেরা পছন্দ?",
            "{$cleanName} এর বিস্তারিত স্পেসিফিকেশন, সুবিধা ও কেনার গাইড",
            "বাংলাদেশে {$cleanName} এর দাম ও ফিচারস - সেরা অফারে কিনুন বাজার ঘর থেকে",
        ];

        return $templates[array_rand($templates)];
    }

    private function generateTags(string $name, string $category): array
    {
        $tags = ['Bazar Ghor', 'অনলাইন শপিং', 'ক্যাশ অন ডেলিভারি'];
        $cleanName = trim(explode(' ', $name)[0] . ' ' . (explode(' ', $name)[1] ?? ''));
        
        $tags[] = $cleanName;
        $tags[] = "{$cleanName} Price in BD";
        $tags[] = "{$cleanName} দাম";
        $tags[] = $category;

        $lower = strtolower($name);
        if (str_contains($lower, 'watch')) {
            $tags[] = 'Smartwatch BD';
            $tags[] = 'স্মার্টওয়াচ প্রাইস';
        } elseif (str_contains($lower, 'airpods') || str_contains($lower, 'earbuds') || str_contains($lower, 'neckband')) {
            $tags[] = 'Wireless Audio';
            $tags[] = 'ব্লুটুথ হেডফোন';
        } elseif (str_contains($lower, 'multiplug')) {
            $tags[] = 'Smart Multiplug';
            $tags[] = 'ইলেকট্রিক্যাল গ্যাজেট';
        } elseif (str_contains($lower, 'ups')) {
            $tags[] = 'Router UPS';
            $tags[] = 'মিনি ইউপিএস';
        }

        return array_values(array_unique($tags));
    }

    private function generateBlogContent(Product $product, string $cleanName, string $category, string $priceText, ?string $oldPriceText, string $productUrl): string
    {
        $name = htmlspecialchars($cleanName, ENT_QUOTES, 'UTF-8');
        $rawDesc = strip_tags((string) ($product->description ?: $product->short_description));
        $descParagraphs = array_filter(array_map('trim', explode("\n", $rawDesc)));
        $firstDesc = !empty($descParagraphs) ? reset($descParagraphs) : "প্রিমিয়াম কোয়ালিটি এবং দীর্ঘস্থায়ী পারফরম্যান্স সমৃদ্ধ {$name}।";

        $html = "
        <p class=\"lead text-base sm:text-lg text-gray-700 leading-relaxed font-medium mb-5\">
            বর্তমান ডিজিটাল জীবনে নির্ভরযোগ্য এবং আধুনিক গ্যাজেট আমাদের দৈনন্দিন কাজকে অনেক সহজ ও স্বাচ্ছন্দ্যময় করে তোলে। আপনি যদি সেরা মানের <strong>{$name}</strong> কেনার পরিকল্পনা করে থাকেন, তবে এই রিভিউটি আপনার সঠিক সিদ্ধান্ত নিতে সাহায্য করবে।
        </p>

        <h2 class=\"text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2\">
            {$name} কেন বাজারের অন্যতম সেরা পছন্দ?
        </h2>
        <p class=\"text-gray-700 leading-relaxed mb-4\">
            {$firstDesc}
        </p>
        <p class=\"text-gray-700 leading-relaxed mb-4\">
            ক্যাটাগরি হিসেবে <strong>{$category}</strong> সেকশনে এই পণ্যটি চমৎকার সুনাম অর্জন করেছে। এর আধুনিক ডিজাইন, টেকসই বিল্ড কোয়ালিটি এবং সাশ্রয়ী দামের কারণে এটি বাংলাদেশের গ্রাহকদের মাঝে ব্যাপক জনপ্রিয়তা লাভ করেছে।
        </p>

        <!-- Feature Highlight Box -->
        <div class=\"my-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 p-5 sm:p-6 shadow-xs\">
            <h3 class=\"text-lg font-bold text-[#2d6a27] mb-3 flex items-center gap-2\">
                <span>⚡</span> মূল বৈশিষ্ট্য ও আকর্ষণীয় ফিচারসমূহ:
            </h3>
            <ul class=\"space-y-2 text-gray-800 text-sm sm:text-base list-disc list-inside\">
                <li><strong>প্রিমিয়াম বিল্ড ও ফিনিশিং:</strong> দীর্ঘস্থায়ী ব্যবহারের জন্য উন্নত উপাদান দ্বারা তৈরি।</li>
                <li><strong>ব্যবহারের সহজতা:</strong> প্লাগ-অ্যান্ড-প্লে বা সহজ কন্ট্রোল সিস্টেম, যা যে কেউ সহজে পরিচালনা করতে পারে।</li>
                <li><strong>সর্বোচ্চ নিরাপত্তা ও স্থায়িত্ব:</strong> অতিরিক্ত ওভারলোড বা শর্ট-সার্কিট প্রটেকশন সুবিধা।</li>
                <li><strong>স্মার্ট ও কমপ্যাক্ট ডিজাইন:</strong> যেকোনো আধুনিক রুম, টেবিল বা ট্রাভেলের সাথে সহজে মানানসই।</li>
                <li><strong>মূল্য সাশ্রয়ী:</strong> বাজেটের মধ্যে সবচেয়ে প্রিমিয়াম কোয়ালিটির অভিজ্ঞতা।</li>
            </ul>
        </div>

        <h2 class=\"text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2\">
            দৈনন্দিন ব্যবহারে এর কার্যকারিতা ও উপকারিতা
        </h2>
        <p class=\"text-gray-700 leading-relaxed mb-4\">
            আমাদের প্রতিদিনের ব্যস্ততায় এমন গ্যাজেট প্রয়োজন যা কখনো হতাশ করবে না। {$name} ঠিক সেই নির্ভরযোগ্যতা নিশ্চিত করে। আপনি অফিসে থাকুন, বাসায় থাকুন বা কোথাও ভ্রমণে যান—এর প্রতিটি ফিচার আপনাকে স্মুথ এবং ঝামেলামুক্ত অভিজ্ঞতা দেবে।
        </p>

        <!-- CTA Buy Box -->
        <div class=\"my-8 rounded-2xl bg-linear-to-r from-emerald-900 to-[#2d6a27] p-6 text-white text-center shadow-lg\">
            <span class=\"inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-2\">
                সীমিত সময়ের বিশেষ অফার
            </span>
            <h3 class=\"text-xl sm:text-2xl font-black mb-2\">
                অরিজিনাল {$name} কিনুন সেরা দামে!
            </h3>
            <p class=\"text-sm text-emerald-100 max-w-xl mx-auto mb-4\">
                সারা বাংলাদেশে দ্রুততম ক্যাশ অন ডেলিভারি এবং পার্সেল চেক করে টাকা পরিশোধের গ্যারান্টি।
            </p>
            <div class=\"flex items-center justify-center gap-3 mb-5 font-bold\">
                <span class=\"text-2xl sm:text-3xl font-extrabold text-yellow-300\">{$priceText}</span>";

        if ($oldPriceText) {
            $html .= "<span class=\"text-sm sm:text-base line-through text-emerald-200 opacity-80\">{$oldPriceText}</span>";
        }

        $html .= "
            </div>
            <a href=\"{$productUrl}\" class=\"inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-7 py-3.5 text-sm sm:text-base font-black shadow-md transition-all transform hover:scale-105 cursor-pointer\">
                🛒 এখনই অর্ডার করুন
            </a>
        </div>

        <h2 class=\"text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2\">
            কেন বাজার ঘর (Bazar Ghor) থেকে কিনবেন?
        </h2>
        <div class=\"grid grid-cols-1 sm:grid-cols-2 gap-4 my-4\">
            <div class=\"p-4 rounded-xl border border-gray-200 bg-white shadow-2xs\">
                <h4 class=\"font-bold text-gray-900 text-sm mb-1\">✔ ১০০% অরিজিনাল প্রোডাক্ট গ্যারান্টি</h4>
                <p class=\"text-xs text-gray-600\">আমরা সরাসরি অথেনটিক সোর্স থেকে প্রতিটি গ্যাজেট সংগ্রহ করি, তাই গুণগত মান নিয়ে কোনো সন্দেহ নেই।</p>
            </div>
            <div class=\"p-4 rounded-xl border border-gray-200 bg-white shadow-2xs\">
                <h4 class=\"font-bold text-gray-900 text-sm mb-1\">✔ ক্যাশ অন ডেলিভারি (COD)</h4>
                <p class=\"text-xs text-gray-600\">কোনো অগ্রিম পেমেন্টের ঝামেলা নেই। প্রোডাক্ট হাতে পেয়ে দেখে তারপর সম্পূর্ণ টাকা পরিশোধ করুন।</p>
            </div>
            <div class=\"p-4 rounded-xl border border-gray-200 bg-white shadow-2xs\">
                <h4 class=\"font-bold text-gray-900 text-sm mb-1\">✔ দ্রুততম হোম ডেলিভারি</h4>
                <p class=\"text-xs text-gray-600\">ঢাকার ভেতরে ২৪-৪৮ ঘণ্টা এবং ঢাকার বাইরে ২-৩ দিনের মধ্যে নির্ভরযোগ্য কুরিয়ারে ডেলিভারি।</p>
            </div>
            <div class=\"p-4 rounded-xl border border-gray-200 bg-white shadow-2xs\">
                <h4 class=\"font-bold text-gray-900 text-sm mb-1\">✔ ৭ দিনের রিপ্লেসমেন্ট সাপোর্ট</h4>
                <p class=\"text-xs text-gray-600\">যেকোনো ম্যানুফ্যাকচারিং ত্রুটিতে রয়েছে দ্রুত ও ঝামেলামুক্ত রিপ্লেসমেন্ট ওয়ারেন্টি পলিসি।</p>
            </div>
        </div>

        <h2 class=\"text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2\">
            সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)
        </h2>
        <div class=\"space-y-3 mb-6 text-sm text-gray-800\">
            <div class=\"p-4 rounded-xl bg-gray-50 border border-gray-200\">
                <p class=\"font-bold text-gray-900 mb-1\">প্রশ্ন: এই প্রোডাক্টটি কি আসল এবং কোনো সমস্যা হলে ওয়ারেন্টি পাব?</p>
                <p class=\"text-gray-600\">উত্তর: হ্যাঁ, বাজার ঘরের প্রতিটি পণ্য ১০০% অরিজিনাল। যেকোনো প্রস্তুতকারক ত্রুটিতে আমাদের ৭ দিনের সহজ রিপ্লেসমেন্ট সুবিধা পাবেন।</p>
            </div>
            <div class=\"p-4 rounded-xl bg-gray-50 border border-gray-200\">
                <p class=\"font-bold text-gray-900 mb-1\">প্রশ্ন: ডেলিভারি পেতে কতদিন সময় লাগবে?</p>
                <p class=\"text-gray-600\">উত্তর: অর্ডার কনফার্মের পর ঢাকার ভেতরে ১-২ কর্মদিবস এবং ঢাকার বাইরে ২-৩ দিনের মধ্যে Steadfast কুরিয়ারের মাধ্যমে ডেলিভারি করা হয়।</p>
            </div>
        </div>

        <p class=\"text-gray-700 leading-relaxed font-medium mt-6\">
            আপনি যদি একটি খাঁটি এবং সেরা কোয়ালিটির গ্যাজেট খুঁজছেন, তবে নির্দ্বিধায় <strong>{$name}</strong> বেছে নিতে পারেন। সরাসরি বাজার ঘর শপ থেকে অর্ডার করে উপভোগ করুন বাজারের সেরা প্রাইস ও নিশ্চিন্ত শপিংয়ের অভিজ্ঞতা।
        </p>
        ";

        return trim($html);
    }
}
