<?php

use Illuminate\Support\Facades\Http;

if (!function_exists('http_with_timeout')) {
    /**
     * Trick 02 — Timeouts on HTTP are the easy half.
     *
     * Anything that crosses a process boundary can hang.
     * Use this wrapper for all outbound HTTP calls so every request
     * has an explicit deadline rather than relying on PHP's defaults.
     *
     * @throws \Illuminate\Http\Client\ConnectionException on timeout
     */
    function http_with_timeout(int $seconds = 5): \Illuminate\Http\Client\PendingRequest
    {
        return Http::timeout($seconds)
                   ->connectTimeout(3)
                   ->retry(2, 200);
    }
}
