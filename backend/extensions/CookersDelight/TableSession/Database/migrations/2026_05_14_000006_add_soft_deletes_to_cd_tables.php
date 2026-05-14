<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Trick 09 — Don't DELETE. Mark it gone.
 *
 * Audit trails. Mistake recovery. Support tickets six months later.
 * DELETE is forever. deleted_at is a Tuesday afternoon.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cd_dining_tables', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('cd_table_sessions', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('cd_dining_tables', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('cd_table_sessions', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
