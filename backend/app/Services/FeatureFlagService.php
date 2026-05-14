<?php

namespace App\Services;

use CookersDelight\TableSession\Models\CdSetting;
use Illuminate\Support\Facades\Cache;

/**
 * Trick 05 — Deploying is not the same as releasing.
 *
 * Code live to nobody is safer than code rolled back to everyone.
 * Every risky path goes behind a flag.
 *
 * Flags live in the cd_settings table under group='feature_flags'.
 * Value '1' = enabled, anything else (or absent) = disabled.
 * Results are cached for 60 seconds to avoid a DB hit per request.
 */
class FeatureFlagService
{
    public function isEnabled(string $flag): bool
    {
        return Cache::remember("feature_flag:{$flag}", 60, function () use ($flag) {
            $setting = CdSetting::where('key', $flag)
                ->where('group', 'feature_flags')
                ->first();

            return $setting && $setting->value === '1';
        });
    }

    public function enable(string $flag): void
    {
        CdSetting::updateOrCreate(
            ['key' => $flag, 'group' => 'feature_flags'],
            ['value' => '1']
        );
        Cache::forget("feature_flag:{$flag}");
    }

    public function disable(string $flag): void
    {
        CdSetting::updateOrCreate(
            ['key' => $flag, 'group' => 'feature_flags'],
            ['value' => '0']
        );
        Cache::forget("feature_flag:{$flag}");
    }
}
