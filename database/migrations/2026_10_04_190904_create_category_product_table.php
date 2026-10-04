<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('category_product', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->primary(['product_id', 'category_id']);
        });

        // Migrate existing product-category relationships into the pivot table
        $existing = DB::table('products')
            ->whereNotNull('category_id')
            ->select('id as product_id', 'category_id')
            ->get();

        foreach ($existing as $row) {
            DB::table('category_product')->insertOrIgnore([
                'product_id' => $row->product_id,
                'category_id' => $row->category_id,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_product');
    }
};
