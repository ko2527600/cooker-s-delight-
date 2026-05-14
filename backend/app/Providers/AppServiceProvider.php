<?php

namespace App\Providers;

use App\Services\BusinessMetricsService;
use App\Services\CircuitBreakerService;
use App\Services\FeatureFlagService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Trick 05 — feature flags backed by cd_settings KV store
        $this->app->singleton(FeatureFlagService::class);

        // Trick 07 — circuit breaker: 5 failures opens the circuit for 60 s
        $this->app->singleton(CircuitBreakerService::class, fn () => new CircuitBreakerService(
            failureThreshold: (int) env('CIRCUIT_BREAKER_THRESHOLD', 5),
            cooldownSeconds:  (int) env('CIRCUIT_BREAKER_COOLDOWN', 60),
        ));

        // Trick 10 — business metrics emitted to dedicated log channel
        $this->app->singleton(BusinessMetricsService::class);
    }

    public function boot(): void {}
}
