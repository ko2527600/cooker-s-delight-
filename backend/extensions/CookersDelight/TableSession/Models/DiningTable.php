<?php

namespace CookersDelight\TableSession\Models;

use Igniter\Flame\Database\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * One physical table per location. Each row maps to exactly one QR code.
 *
 * stable_token  — permanent UUID printed on the QR card, never changes.
 * TableSession  — ephemeral 4-hour session created each time the QR is scanned.
 */
class DiningTable extends Model
{
    // Trick 09 — Don't DELETE. Mark it gone.
    use SoftDeletes;
    protected $table = 'cd_dining_tables';

    protected $fillable = [
        'location_id',
        'table_number',
        'stable_token',
        'capacity',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        // Auto-assign a stable token when a table is first created.
        static::creating(function (self $table) {
            if (empty($table->stable_token)) {
                $table->stable_token = Str::uuid()->toString();
            }
        });
    }

    public function location()
    {
        return $this->belongsTo(\Igniter\Local\Models\Location::class, 'location_id');
    }

    public function sessions()
    {
        return $this->hasMany(TableSession::class, 'table_id');
    }

    public function activeSession(): ?TableSession
    {
        return $this->sessions()
            ->whereNull('closed_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();
    }

    /**
     * The permanent URL printed on the physical QR card.
     * Points to kawax using the stable token — never expires.
     */
    public function qrUrl(): string
    {
        return rtrim(config('app.qr_order_url', config('app.url')), '/') . '/table/' . $this->stable_token;
    }

    /**
     * Create a new 4-hour session for this table, closing any open one first.
     */
    public function createSession(): TableSession
    {
        $this->sessions()->whereNull('closed_at')->update(['closed_at' => now()]);

        return $this->sessions()->create([
            'token'      => Str::uuid()->toString(),
            'expires_at' => now()->addHours(4),
        ]);
    }
}
