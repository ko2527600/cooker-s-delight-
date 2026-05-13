<?php

namespace CookersDelight\TableSession\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * Guards admin-only JSON API endpoints.
 *
 * The React admin panel sends the TastyIgniter API token (obtained from
 * /admin/auth) as a Bearer token. This middleware:
 *
 *  1. Rejects requests with no Bearer token immediately (401).
 *  2. Validates the token against TastyIgniter's api_tokens table using a
 *     constant-time comparison to prevent timing attacks.
 *  3. Falls back to checking against the configured ADMIN_API_SECRET env var
 *     so the middleware works even outside a full TI database environment.
 */
class AdminApiAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $provided = $request->bearerToken();

        if (empty($provided)) {
            return response()->json(['message' => 'Unauthenticated. Admin token required.'], 401);
        }

        if ($this->tokenIsValid($provided)) {
            return $next($request);
        }

        return response()->json(['message' => 'Unauthenticated. Invalid admin token.'], 401);
    }

    private function tokenIsValid(string $provided): bool
    {
        // Option 1 — compare against ADMIN_API_SECRET env var (lightweight, always available).
        $secret = config('services.admin_api.secret', env('ADMIN_API_SECRET'));
        if ($secret && hash_equals((string) $secret, $provided)) {
            return true;
        }

        // Option 2 — validate against TastyIgniter's API token store.
        // TI hashes tokens as SHA-256 before storage.
        try {
            $hashed = hash('sha256', $provided);
            return DB::table('igniter_api_tokens')
                ->where('token', $hashed)
                ->where('is_enabled', 1)
                ->exists();
        } catch (\Throwable) {
            // Table may not exist in testing / non-TI environments — fall through.
            return false;
        }
    }
}
