<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

/**
 * Stable-token QR entry point — the URL printed on physical QR cards.
 *
 * The stable_token never expires. On scan, TI creates a fresh 4-hour
 * session and returns the ephemeral session_token for this visit.
 */
Route::get('/table/{stableToken}', function (string $stableToken) {
    $response = \Illuminate\Support\Facades\Http::baseUrl(config('tastyigniter.api_url'))
        ->withToken(config('tastyigniter.api_token'))
        ->post("/table-sessions/by-table/{$stableToken}");

    if ($response->failed()) {
        abort(404, 'Table not found or inactive. Please ask a member of staff for help.');
    }

    $session = $response->json();

    session([
        'cd_session_token' => $session['session_token'],
        'cd_table_number'  => $session['table_number'],
        'cd_location_id'   => $session['location_id'],
        'cd_location_name' => $session['location_name'],
    ]);

    return redirect(route('menus', ['session' => $session['session_token']]));
})->name('table.entry');

// Legacy QR entry (old session-token-based URL, kept for any printed cards still in use)
Route::get('/qr/{token}', function ($token) {
    return redirect(route('menus', ['token' => $token]));
})->name('qr.entry');

// Paystack callback (must be GET, not POST)
Route::get('/paystack/callback', [\App\Payment\PaystackDriver::class, 'callback'])->name('paystack.callback');

// Order status tracking page
Route::get('/orders/{orderId}/status', [\App\Http\Controllers\OrderStatusController::class, 'show'])->name('order.status');
