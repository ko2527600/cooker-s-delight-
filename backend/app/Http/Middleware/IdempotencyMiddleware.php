<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

/**
 * Trick 03 — Make the second click a no-op, not a bug.
 *
 * Clients send an `Idempotency-Key` header (a UUID they generate once per
 * user intent).  We cache the first successful response and replay it for
 * any repeat request with the same key.  This means double-taps, network
 * retries, and page refreshes never create duplicate sessions or orders.
 *
 * Only applied to POST routes (reads are already safe).
 */
class IdempotencyMiddleware
{
    private const TTL_SECONDS = 86_400; // 24 hours

    public function handle(Request $request, Closure $next): Response
    {
        $key = $request->header('Idempotency-Key');

        if (empty($key) || strlen($key) > 128) {
            return $next($request);
        }

        $cacheKey = 'idempotency:' . hash('sha256', $key);

        $cached = Cache::get($cacheKey);
        if ($cached !== null) {
            return response()->json(
                $cached['body'],
                $cached['status'],
                ['X-Idempotency-Replayed' => 'true']
            );
        }

        /** @var Response $response */
        $response = $next($request);

        // Only cache successful responses so failures can be retried freely.
        if ($response->getStatusCode() < 400) {
            Cache::put($cacheKey, [
                'status' => $response->getStatusCode(),
                'body'   => json_decode($response->getContent(), true),
            ], self::TTL_SECONDS);
        }

        return $response;
    }
}
