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
        $admin = User::firstOrCreate(
            ['email' => 'admin@bazarghor.com'],
            [
                'name' => 'Bazar Ghor Admin',
                'email' => 'admin@bazarghor.com',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
            ]
        );
        if ($admin->role !== 'admin') {
            $admin->role = 'admin';
            $admin->save();
        }

        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
            SocialLinkSeeder::class,
            BlogPostSeeder::class,
        ]);
    }
}
