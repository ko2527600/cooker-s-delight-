<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cd_table_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('table_id');
            $table->uuid('token')->unique();       // unguessable, used in QR URL
            $table->unsignedBigInteger('order_id')->nullable(); // set after order placed
            $table->timestamp('expires_at');       // 4 hours from creation
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->index('token');
            $table->foreign('table_id')->references('id')->on('cd_dining_tables')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cd_table_sessions');
    }
};
