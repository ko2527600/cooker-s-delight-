<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Stores estimated kitchen preparation time per menu item.
 * Admin sets this once; it drives the estimated wait time shown in the cart.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cd_menu_prep_times', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('menu_id')->unique();
            $table->unsignedTinyInteger('prep_time_minutes')->default(15);
            $table->timestamps();

            $table->foreign('menu_id')->references('menu_id')->on('menus')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cd_menu_prep_times');
    }
};
