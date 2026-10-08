<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitor_logs', function (Blueprint $table) {
            $table->id();
            $table->string('visitor_id', 64)->index();
            $table->string('session_id', 64)->index();
            $table->string('page_path', 255)->index();
            $table->string('page_title', 255)->nullable();
            $table->string('device_type', 20)->default('desktop');
            $table->string('browser', 50)->nullable();
            $table->string('platform', 50)->nullable();
            $table->string('referer', 255)->nullable();
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['created_at', 'page_path']);
            $table->index(['created_at', 'visitor_id']);
            $table->index(['created_at', 'device_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitor_logs');
    }
};
