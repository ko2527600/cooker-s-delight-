<?php

/**
 * CORS Configuration
 *
 * SECURITY: Never use wildcard ('*') origins in production.
 * Set APP_CORS_ORIGINS in your .env file to a comma-separated list of
 * trusted frontend domains, e.g.:
 *
 *   APP_CORS_ORIGINS=https://cookersdelight.com,https://admin.cookersdelight.com
 *
 * If APP_CORS_ORIGINS is not set the fallback is APP_URL, which ensures the
 * same-origin case still works in development.
 */

$rawOrigins = env('APP_CORS_ORIGINS', env('APP_URL', 'http://localhost:5173'));
$allowedOrigins = array_filter(array_map('trim', explode(',', $rawOrigins)));

return [

    'paths' => ['api/*', 'webhooks/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => $allowedOrigins,

    'allowed_origins_patterns' => [],

    // Restrict headers to only what the frontend actually sends.
    'allowed_headers' => ['Authorization', 'Content-Type', 'Accept', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 86400, // 24 hours — browsers can cache preflight responses

    'supports_credentials' => false,

];
