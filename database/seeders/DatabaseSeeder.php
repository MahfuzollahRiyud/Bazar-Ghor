<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin User
        User::firstOrCreate(
            ['email' => 'admin@bazarghor.com'],
            [
                'name' => 'Bazar Ghor Admin',
                'email' => 'admin@bazarghor.com',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
            SocialLinkSeeder::class,
        ]);
    }
}
