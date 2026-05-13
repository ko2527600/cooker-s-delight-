<?php

namespace Tests\Feature;

use Tests\TestCase;
use Mockery;
use Illuminate\Support\Facades\Config;
use CookersDelight\TableSession\Models\TableSession;
use CookersDelight\TableSession\Models\MenuPrepTime;

/**
 * Regression Tests — guard against previously identified bugs and ensure that
 * core invariants remain stable as the codebase evolves.
 */
class RegressionTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─── Paystack webhook idempotency ─────────────────────────────────────────

    /**
     * REGRESSION: A second identical webhook must not double-update an order.
     * The controller checks `$order->processed == 1` and returns early.
     */
    public function test_paystack_webhook_skips_already_processed_order(): void
    {
        $secret    = 'regression_secret';
        Config::set('services.paystack.secret_key', $secret);

        $orderId   = 200;
        $reference = "CD-{$orderId}-1234567";

        \Illuminate\Support\Facades\DB::shouldReceive('table')
            ->with('orders')
            ->andReturnSelf()
            ->shouldReceive('where')
            ->andReturnSelf()
            ->shouldReceive('first')
            ->andReturn((object)['order_id' => $orderId, 'processed' => 1]);

        // 'update' must NOT be called — already processed
        \Illuminate\Support\Facades\DB::shouldReceive('table')
            ->with('orders')
            ->never();

        $payload   = json_encode([
            'event' => 'charge.success',
            'data'  => ['reference' => $reference, 'amount' => 3000, 'channel' => 'mobile_money'],
        ]);
        $signature = hash_hmac('sha512', $payload, $secret);

        $response = $this->postJson(
            '/api/paystack-webhook',
            json_decode($payload, true),
            ['X-Paystack-Signature' => $signature]
        );

        $response->assertStatus(200); // must not error
    }

    // ─── Session expiry gate ───────────────────────────────────────────────────

    /**
     * REGRESSION: Expired sessions must always return 410, never 200.
     * This prevented orders being placed on stale sessions.
     */
    public function test_expired_session_always_returns_410_not_200(): void
    {
        $expiredSession = Mockery::mock(TableSession::class)->makePartial();
        $expiredSession->shouldReceive('isValid')->andReturn(false);
        $expiredSession->order_id = null;

        Mockery::mock('alias:' . TableSession::class)
               ->shouldReceive('where->firstOrFail')
               ->andReturn($expiredSession);

        $response = $this->postJson('/api/table-sessions/old-token/order', ['order_id' => 1]);

        $this->assertNotEquals(200, $response->status(), 'Expired session must not return 200');
        $response->assertStatus(410);
    }

    // ─── Prep time validation boundaries ──────────────────────────────────────

    /**
     * REGRESSION: prep_time_minutes = 1 is the minimum valid value.
     * Ensure the boundary is inclusive (1 passes, 0 fails).
     */
    public function test_prep_time_minimum_boundary_is_inclusive(): void
    {
        $record = Mockery::mock(MenuPrepTime::class)->makePartial();
        $record->menu_id           = 5;
        $record->prep_time_minutes = 1;

        Mockery::mock('alias:' . MenuPrepTime::class)
               ->shouldReceive('updateOrCreate')
               ->andReturn($record);

        $valid   = $this->putJson('/api/cd/prep-times/5', ['prep_time_minutes' => 1]);
        $invalid = $this->putJson('/api/cd/prep-times/5', ['prep_time_minutes' => 0]);

        $valid->assertStatus(200);
        $invalid->assertStatus(422);
    }

    /**
     * REGRESSION: prep_time_minutes = 120 is the maximum valid value.
     * Ensure the boundary is inclusive (120 passes, 121 fails).
     */
    public function test_prep_time_maximum_boundary_is_inclusive(): void
    {
        $record = Mockery::mock(MenuPrepTime::class)->makePartial();
        $record->menu_id           = 5;
        $record->prep_time_minutes = 120;

        Mockery::mock('alias:' . MenuPrepTime::class)
               ->shouldReceive('updateOrCreate')
               ->andReturn($record);

        $valid   = $this->putJson('/api/cd/prep-times/5', ['prep_time_minutes' => 120]);
        $invalid = $this->putJson('/api/cd/prep-times/5', ['prep_time_minutes' => 121]);

        $valid->assertStatus(200);
        $invalid->assertStatus(422);
    }

    // ─── Double order placement guard ─────────────────────────────────────────

    /**
     * REGRESSION: once an order is linked to a session, a second order link
     * attempt must be rejected with 409 — never silently overwrite order_id.
     */
    public function test_double_order_link_is_always_rejected(): void
    {
        $session = Mockery::mock(TableSession::class)->makePartial();
        $session->shouldReceive('isValid')->andReturn(true);
        $session->order_id = 55;

        Mockery::mock('alias:' . TableSession::class)
               ->shouldReceive('where->firstOrFail')
               ->andReturn($session);

        $response = $this->postJson('/api/table-sessions/some-token/order', ['order_id' => 99]);

        $response->assertStatus(409);
        $this->assertStringContainsString(
            'Order already placed',
            $response->json('error'),
            'Error message must mention order already placed'
        );
    }

    // ─── Paystack reference format ─────────────────────────────────────────────

    /**
     * REGRESSION: webhook must silently ignore references that don't match
     * the "CD-{id}-{ts}" format instead of throwing an exception.
     */
    public function test_paystack_unrecognised_reference_format_returns_200(): void
    {
        $secret  = 'regression_secret2';
        Config::set('services.paystack.secret_key', $secret);

        \Illuminate\Support\Facades\DB::shouldReceive('table')
            ->with('orders')
            ->andReturnSelf()
            ->shouldReceive('where')
            ->andReturnSelf()
            ->shouldReceive('first')
            ->never();

        $payload   = json_encode([
            'event' => 'charge.success',
            'data'  => ['reference' => 'THIRDPARTY-XYZ-9999', 'amount' => 1000, 'channel' => 'card'],
        ]);
        $signature = hash_hmac('sha512', $payload, $secret);

        $response = $this->postJson(
            '/api/paystack-webhook',
            json_decode($payload, true),
            ['X-Paystack-Signature' => $signature]
        );

        $response->assertStatus(200);
    }
}
