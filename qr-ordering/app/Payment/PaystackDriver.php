<?php

declare(strict_types=1);

namespace App\Payment;

use App\Services\TastyIgniterOrderService;
use Revolution\Ordering\Contracts\Payment\PaymentDriver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Paystack payment driver for kawax/self-ordering.
 *
 * Flow:
 *   1. kawax calls pay() → we initialize a Paystack transaction and redirect.
 *   2. Paystack redirects back to /paystack/callback with a reference.
 *   3. We verify the transaction with Paystack's API.
 *   4. On success, we submit the order to TastyIgniter.
 *   5. TastyIgniter's Paystack webhook (on the backend) marks it paid.
 *
 * CRITICAL: We do NOT mark the order paid here. The webhook in TI does that.
 */
class PaystackDriver implements PaymentDriver
{
    public function __construct(private TastyIgniterOrderService $ti) {}

    /**
     * Initiate a Paystack payment and redirect the customer to the Paystack checkout.
     */
    public function pay(Request $request): mixed
    {
        $cart          = session('ordering_cart', []);
        $tableToken    = $request->query('token');
        $customerName  = $request->input('customer_name', 'Guest');
        $customerEmail = $request->input('customer_email', 'guest@cookersdelight.com');

        if (empty($cart)) {
            return redirect()->route('menus')->withErrors(['cart' => 'Cart is empty.']);
        }

        // Submit order to TI first to get an order_id for the Paystack reference.
        try {
            $order = $this->ti->submitOrder($cart, $tableToken, $customerName, $customerEmail);
        } catch (\Throwable $e) {
            Log::error('Order submission failed before Paystack', ['error' => $e->getMessage()]);
            return redirect()->route('menus')->withErrors(['order' => 'Could not place order. Please try again.']);
        }

        $orderId   = $order['order_id'];
        $reference = 'CD-' . $orderId . '-' . time();
        $amount    = $this->cartTotal($cart) * 100; // pesewa

        // Compute estimated wait: max prep time across cart items + 5 min kitchen buffer.
        // Dishes are cooked in parallel so we use max, not sum.
        $prepTimes = $this->ti->fetchPrepTimes();
        $maxPrepTime = collect($cart)->map(fn ($item) => $prepTimes[$item['id']] ?? 15)->max();
        $estimatedWait = ($maxPrepTime ?? 15) + 5;

        session([
            'pending_order_id'          => $orderId,
            'paystack_reference'        => $reference,
            'cd_estimated_wait_minutes' => $estimatedWait,
        ]);

        $response = Http::withToken(config('services.paystack.secret_key'))
            ->post('https://api.paystack.co/transaction/initialize', [
                'email'     => $customerEmail,
                'amount'    => (int) $amount,
                'reference' => $reference,
                'currency'  => 'GHS',
                'callback_url' => route('paystack.callback'),
                'metadata'  => ['order_id' => $orderId, 'table_token' => $tableToken],
            ]);

        if ($response->failed()) {
            Log::error('Paystack initialize failed', ['body' => $response->body()]);
            return redirect()->route('menus')->withErrors(['payment' => 'Payment gateway error.']);
        }

        return redirect($response->json('data.authorization_url'));
    }

    /**
     * Paystack redirects here after the customer completes (or cancels) payment.
     * We verify the transaction but do NOT mark the order paid — that is the webhook's job.
     */
    public function callback(Request $request): mixed
    {
        $reference = $request->query('reference', session('paystack_reference'));
        $orderId   = session('pending_order_id');

        // Verify with Paystack API (never trust the frontend callback alone).
        $verify = Http::withToken(config('services.paystack.secret_key'))
            ->get("https://api.paystack.co/transaction/verify/{$reference}");

        $status = $verify->json('data.status');

        if ($status !== 'success') {
            Log::warning('Paystack callback: payment not successful', ['status' => $status, 'ref' => $reference]);
            return redirect()->route('menus')->withErrors(['payment' => 'Payment was not completed.']);
        }

        // Clear cart. Order paid status is updated by TI webhook — not here.
        session()->forget(['ordering_cart', 'pending_order_id', 'paystack_reference']);

        // Send customer to order tracking page.
        return redirect()->route('order.status', ['order_id' => $orderId]);
    }

    private function cartTotal(array $cart): float
    {
        return collect($cart)->sum(fn ($item) => $item['price'] * $item['quantity']);
    }
}
