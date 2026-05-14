<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * Trick 10 — CPU is fine. The business is on fire.
 *
 * Healthy servers can serve a totally broken product.
 * Alert on what the user does, not on what the box does.
 *
 * Emits structured JSON events to a dedicated 'business' log channel.
 * Parse with any log aggregator (Papertrail, Loki, CloudWatch Insights).
 *
 * Standard events:
 *   session.created   — customer scanned a QR code
 *   order.linked      — order_id attached to a session
 *   payment.success   — Paystack confirmed payment
 *   payment.failed    — payment processing threw an exception
 *   session.expired   — a session was accessed after expiry
 */
class BusinessMetricsService
{
    public function record(string $event, array $context = []): void
    {
        Log::channel('business')->info($event, array_merge([
            'event'      => $event,
            'timestamp'  => now()->toIso8601String(),
        ], $context));
    }
}
