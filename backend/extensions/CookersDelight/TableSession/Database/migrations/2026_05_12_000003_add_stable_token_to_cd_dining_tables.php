<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Adds a permanent stable_token (UUID) to each dining table.
 *
 * This is the token printed on physical QR codes. It never changes,
 * so a printed QR is valid indefinitely. Scanning it creates a fresh
 * 4-hour TableSession — the session token is what expires, not this one.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cd_dining_tables', function (Blueprint $table) {
            $table->uuid('stable_token')->nullable()->unique()->after('table_number');
        });

        // Backfill existing rows with a stable token.
        DB::table('cd_dining_tables')->whereNull('stable_token')->each(function ($row) {
            DB::table('cd_dining_tables')
                ->where('id', $row->id)
                ->update(['stable_token' => Str::uuid()->toString()]);
        });

        Schema::table('cd_dining_tables', function (Blueprint $table) {
            $table->uuid('stable_token')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('cd_dining_tables', function (Blueprint $table) {
            $table->dropColumn('stable_token');
        });
    }
};
