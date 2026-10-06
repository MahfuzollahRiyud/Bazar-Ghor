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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('courier_name', 50)->nullable()->after('payment_method');
            $table->string('consignment_id', 100)->nullable()->after('courier_name');
            $table->string('tracking_code', 100)->nullable()->after('consignment_id');
            $table->string('courier_status', 100)->nullable()->after('tracking_code');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['courier_name', 'consignment_id', 'tracking_code', 'courier_status']);
        });
    }
};
