<?php

namespace Database\Seeders;

use App\Models\SocialLink;
use Illuminate\Database\Seeder;

class SocialLinkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $links = [
            [
                'platform' => 'facebook',
                'title' => 'Facebook Page',
                'url' => 'https://www.facebook.com/onlinebazarghor',
                'icon' => 'facebook',
                'color' => '#1877F2',
                'is_active' => true,
                'show_in_header' => true,
                'show_in_footer' => true,
                'sort_order' => 1,
            ],
            [
                'platform' => 'whatsapp',
                'title' => 'WhatsApp Support',
                'url' => 'https://wa.me/8801613545166',
                'icon' => 'whatsapp',
                'color' => '#25D366',
                'is_active' => true,
                'show_in_header' => true,
                'show_in_footer' => true,
                'sort_order' => 2,
            ],
            [
                'platform' => 'youtube',
                'title' => 'YouTube Channel',
                'url' => 'https://www.youtube.com/@bazarghor',
                'icon' => 'youtube',
                'color' => '#FF0000',
                'is_active' => false,
                'show_in_header' => true,
                'show_in_footer' => true,
                'sort_order' => 3,
            ],
            [
                'platform' => 'instagram',
                'title' => 'Instagram Profile',
                'url' => 'https://www.instagram.com/bazarghor',
                'icon' => 'instagram',
                'color' => '#E4405F',
                'is_active' => false,
                'show_in_header' => true,
                'show_in_footer' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($links as $data) {
            SocialLink::firstOrCreate(
                ['platform' => $data['platform']],
                $data
            );
        }
    }
}
