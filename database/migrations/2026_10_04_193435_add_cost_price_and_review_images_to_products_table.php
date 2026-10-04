<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('cost_price', 10, 2)->nullable()->after('sale_price');
            $table->json('review_images')->nullable()->after('images');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->decimal('cost_price', 10, 2)->nullable()->after('sale_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['cost_price', 'review_images']);
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn(['cost_price']);
        });
    }
};
