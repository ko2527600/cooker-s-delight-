<?php

namespace App\Providers;

use App\Menu\TastyIgniterMenuDriver;
use App\Payment\PaystackDriver;
use App\Services\TastyIgniterOrderService;
use Illuminate\Support\ServiceProvider;
use Revolution\Ordering\Facades\Menu;
use Revolution\Ordering\Facades\Payment;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(TastyIgniterOrderService::class);
    }

    public function boot(): void
    {
        // Register the TastyIgniter menu driver with kawax.
        Menu::extend('tastyigniter', function ($app) {
            return $app->make(TastyIgniterMenuDriver::class);
        });

        // Register the Paystack payment driver with kawax.
        Payment::extend('paystack', function ($app) {
            return $app->make(PaystackDriver::class);
        });
    }
}
