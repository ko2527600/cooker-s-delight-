<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cd_dining_tables', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('location_id');
            $table->string('table_number', 10);
            $table->unsignedTinyInteger('capacity')->default(4);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['location_id', 'table_number']);
            $table->foreign('location_id')->references('location_id')->on('locations')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cd_dining_tables');
    }
};
