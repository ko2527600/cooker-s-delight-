<?php

namespace CookersDelight\TableSession\Models;

use Igniter\Flame\Database\Model;

/**
 * One QR scan session. Token is a UUID, unguessable, expires after 4 hours.
 */
class TableSession extends Model
{
    protected $table = 'cd_table_sessions';

    protected $fillable = [
        'table_id',
        'token',
        'order_id',
        'expires_at',
        'closed_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'closed_at'  => 'datetime',
    ];

    public function table()
    {
        return $this->belongsTo(DiningTable::class, 'table_id');
    }

    public function isValid(): bool
    {
        return is_null($this->closed_at) && $this->expires_at->isFuture();
    }
}
