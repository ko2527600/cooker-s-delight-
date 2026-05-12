<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// QR session entry point
Route::get('/qr/{token}', function ($token) {
    return redirect(route('menus', ['token' => $token]));
})->name('qr.entry');

// Paystack callback (must be GET, not POST)
Route::get('/paystack/callback', [\App\Payment\PaystackDriver::class, 'callback'])->name('paystack.callback');

// Order status tracking page
Route::get('/orders/{orderId}/status', [\App\Http\Controllers\OrderStatusController::class, 'show'])->name('order.status');
