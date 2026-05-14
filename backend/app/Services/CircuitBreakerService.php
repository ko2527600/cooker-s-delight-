<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Trick 07 — Rate-limit users. Then rate-limit yourselves.
 *
 * One service flooding another is how a retry storm becomes an outage.
 * Internal calls deserve buckets and breakers, not blind retries.
 *
 * State machine: closed → open (on threshold failures) → half-open (after cooldown) → closed
 */
class CircuitBreakerService
{
    private int $failureThreshold;
    private int $cooldownSeconds;

    public function __construct(int $failureThreshold = 5, int $cooldownSeconds = 60)
    {
        $this->failureThreshold = $failureThreshold;
        $this->cooldownSeconds  = $cooldownSeconds;
    }

    /**
     * Run $operation through the circuit breaker for the named $service.
     * If the circuit is open, $fallback is called instead.
     *
     * @throws \Throwable — re-throws the original exception so the caller (or job retry) handles it
     */
    public function attempt(string $service, callable $operation, callable $fallback): mixed
    {
        if ($this->isOpen($service)) {
            Log::warning("CircuitBreaker: {$service} circuit is open — using fallback");
            return $fallback();
        }

        try {
            $result = $operation();
            $this->recordSuccess($service);
            return $result;
        } catch (\Throwable $e) {
            $this->recordFailure($service);
            throw $e;
        }
    }

    public function isOpen(string $service): bool
    {
        return Cache::has($this->openKey($service));
    }

    private function recordFailure(string $service): void
    {
        $countKey  = "circuit:{$service}:failures";
        $failures  = Cache::increment($countKey);

        if ($failures === 1) {
            Cache::put($countKey, 1, $this->cooldownSeconds * 2);
        }

        if ($failures >= $this->failureThreshold) {
            Cache::put($this->openKey($service), true, $this->cooldownSeconds);
            Log::error("CircuitBreaker: {$service} circuit opened after {$failures} failures");
        }
    }

    private function recordSuccess(string $service): void
    {
        Cache::forget("circuit:{$service}:failures");
        Cache::forget($this->openKey($service));
    }

    private function openKey(string $service): string
    {
        return "circuit:{$service}:open";
    }
}
