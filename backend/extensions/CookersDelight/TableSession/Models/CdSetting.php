<?php

namespace CookersDelight\TableSession\Models;

use Illuminate\Database\Eloquent\Model;

class CdSetting extends Model
{
    protected $table    = 'cd_settings';
    protected $fillable = ['key', 'value'];

    public static function getValue(string $key, mixed $default = null): mixed
    {
        return static::where('key', $key)->value('value') ?? $default;
    }

    public static function setValue(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public static function setMany(array $pairs): void
    {
        foreach ($pairs as $key => $value) {
            static::setValue($key, $value);
        }
    }

    public static function allAsMap(): array
    {
        return static::all()->pluck('value', 'key')->all();
    }
}
