<?php

namespace CookersDelight\TableSession\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Paystack sends a POST to this endpoint after every payment event.
 *
 * CRITICAL RULE: Never mark an order as paid from the QR frontend.
 * Only this webhook (with HMAC signature verification) marks payment complete.
 *
 * Docs: https://paystack.com/docs/payments/webhooks/
 */
class PaystackWebhookController extends Controller
{
    public function handle(Request $request): Response
    {
        if (!$this->signatureIsValid($request)) {
            Log::warning('Paystack webhook: invalid signature', ['ip' => $request->ip()]);
            return response('Unauthorized', 401);
        }

        $payload = $request->json()->all();
        $event   = $payload['event'] ?? '';

        match ($event) {
            'charge.success' => $this->handleChargeSuccess($payload['data']),
            default          => null,
        };

        return response('OK', 200);
    }

    private function handleChargeSuccess(array $data): void
    {
        $reference = $data['reference'] ?? null;
        $amount    = ($data['amount'] ?? 0) / 100; // Paystack sends kobo/pesewa

        if (!$reference) return;

        // Reference format we set during payment initiation: "CD-{order_id}-{timestamp}"
        if (!preg_match('/^CD-(\d+)-/', $reference, $m)) {
            Log::warning('Paystack webhook: unrecognised reference format', ['ref' => $reference]);
            return;
        }

        $orderId = (int) $m[1];

        $order = DB::table('orders')->where('order_id', $orderId)->first();
        if (!$order) {
            Log::error('Paystack webhook: order not found', ['order_id' => $orderId]);
            return;
        }

        // Idempotency — skip if already marked paid.
        if ($order->processed == 1) return;

        // Advance status to "Received" (pending → received signals staff to start preparing).
        $receivedStatusId = DB::table('statuses')
            ->where('status_name', 'Received')
            ->where('status_for', 'order')
            ->value('status_id');

        DB::table('orders')->where('order_id', $orderId)->update([
            'processed'      => 1,
            'payment'        => $data['channel'] ?? 'paystack',
            'status_id'      => $receivedStatusId,
            'total_items_tax'=> $amount,
            'updated_at'     => now(),
        ]);

        // Insert status history so admin can see the transition.
        DB::table('status_history')->insert([
            'object_id'  => $orderId,
            'object_type'=> 'order',
            'status_id'  => $receivedStatusId,
            'comment'    => 'Payment confirmed via Paystack webhook. Ref: ' . $reference,
            'notify'     => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Log::info('Paystack: order paid', ['order_id' => $orderId, 'ref' => $reference, 'amount' => $amount]);
    }

    private function signatureIsValid(Request $request): bool
    {
        $secret    = config('services.paystack.secret_key');
        $signature = $request->header('X-Paystack-Signature');
        $computed  = hash_hmac('sha512', $request->getContent(), $secret);

        return hash_equals($computed, $signature ?? '');
    }
}
