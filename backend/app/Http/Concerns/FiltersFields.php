<?php

namespace App\Http\Concerns;

use Illuminate\Http\Request;

/**
 * Trick 01 — Send less.
 *
 * Controllers that use this trait can honour a ?fields=a,b,c query parameter,
 * returning only the requested keys from their shaped response arrays.
 * If ?fields is absent the full array is returned unchanged.
 */
trait FiltersFields
{
    protected function filterFields(array $data): array
    {
        /** @var Request $request */
        $request = app(Request::class);

        $raw = $request->query('fields');
        if (empty($raw)) {
            return $data;
        }

        $allowed = array_filter(array_map('trim', explode(',', $raw)));

        return array_intersect_key($data, array_flip($allowed));
    }
}
