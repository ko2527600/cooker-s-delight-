<?php

namespace Tests\Feature;

use Tests\TestCase;
use Mockery;
use Illuminate\Support\Facades\Config;
use CookersDelight\TableSession\Models\DiningTable;
use CookersDelight\TableSession\Models\TableSession;
use CookersDelight\TableSession\Models\MenuPrepTime;

/**
 * Integration Tests — test coordinated flows that exercise multiple controller
 * actions or service layers together.
 */
class IntegrationTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─── QR scan → session → order flow ───────────────────────────────────────

    /**
     * Full happy-path flow: customer scans QR → fresh session is returned →
     * order is placed → second place-order attempt is rejected as duplicate.
     */
    public function test_qr_scan_creates_session_and_order_link_is_idempotent(): void
    {
        // 1. Simulate table lookup for scan
        $fakeLocation = Mockery::mock();
        $fakeLocation->location_name = 'Airport Branch';

        $fakeSession = Mockery::mock(TableSession::class)->makePartial();
        $fakeSession->token      = 'ephemeral-abc-123';
        $fakeSession->expires_at = now()->addHours(4);

        $fakeTable = Mockery::mock(DiningTable::class)->makePartial();
        $fakeTable->table_number = '7';
        $fakeTable->location_id  = 2;
        $fakeTable->location     = $fakeLocation;
        $fakeTable->shouldReceive('createSession')->once()->andReturn($fakeSession);

        Mockery::mock('alias:' . DiningTable::class)
               ->shouldReceive('where->with->where->firstOrFail')
               ->andReturn($fakeTable);

        $scanResponse = $this->postJson('/api/table-sessions/by-table/stable-qr-token');
        $scanResponse->assertStatus(200)
                     ->assertJsonPath('session_token', 'ephemeral-abc-123')
                     ->assertJsonPath('location_name', 'Airport Branch');

        // 2. Place an order on the returned session token
        $sessionForOrder = Mockery::mock(TableSession::class)->makePartial();
        $sessionForOrder->shouldReceive('isValid')->andReturn(true);
        $sessionForOrder->order_id = null;
        $sessionForOrder->shouldReceive('update')->once()->with(['order_id' => 77])->andReturn(true);
        $sessionForOrder->order_id = 77; // after update

        Mockery::mock('alias:' . TableSession::class)
               ->shouldReceive('where->firstOrFail')
               ->andReturn($sessionForOrder);

        $orderResponse = $this->postJson('/api/table-sessions/ephemeral-abc-123/order', ['order_id' => 77]);
        $orderResponse->assertStatus(200)
                      ->assertJsonPath('order_id', 77)
                      ->assertJsonPath('status', 'linked');

        // 3. Attempt to link a second order — should be rejected
        $sessionAlreadyLinked = Mockery::mock(TableSession::class)->makePartial();
        $sessionAlreadyLinked->shouldReceive('isValid')->andReturn(true);
        $sessionAlreadyLinked->order_id = 77; // already linked

        Mockery::mock('alias:' . TableSession::class)
               ->shouldReceive('where->firstOrFail')
               ->andReturn($sessionAlreadyLinked);

        $duplicateResponse = $this->postJson('/api/table-sessions/ephemeral-abc-123/order', ['order_id' => 88]);
        $duplicateResponse->assertStatus(409);
    }

    // ─── Paystack payment confirmation flow ───────────────────────────────────

    /**
     * Verifies that a valid Paystack charge.success webhook processes correctly
     * and that a second identical webhook is a no-op (idempotency).
     */
    public function test_paystack_charge_success_is_idempotent(): void
    {
        $secret = 'test_secret_key';
        Config::set('services.paystack.secret_key', $secret);

        $orderId   = 123;
        $reference = "CD-{$orderId}-" . time();

        // First webhook call: order exists and is not yet processed
        \Illuminate\Support\Facades\DB::shouldReceive('table')
            ->with('orders')
            ->andReturnSelf()
            ->shouldReceive('where')
            ->with('order_id', $orderId)
            ->andReturnSelf()
            ->shouldReceive('first')
            ->andReturn((object)['order_id' => $orderId, 'processed' => 0])
            ->shouldReceive('update')
            ->andReturn(1);

        \Illuminate\Support\Facades\DB::shouldReceive('table')
            ->with('statuses')
            ->andReturnSelf()
            ->shouldReceive('where')
            ->andReturnSelf()
            ->shouldReceive('value')
            ->andReturn(2);

        \Illuminate\Support\Facades\DB::shouldReceive('table')
            ->with('status_history')
            ->andReturnSelf()
            ->shouldReceive('insert')
            ->andReturn(true);

        $payload   = json_encode([
            'event' => 'charge.success',
            'data'  => ['reference' => $reference, 'amount' => 4500, 'channel' => 'card'],
        ]);
        $signature = hash_hmac('sha512', $payload, $secret);

        $r1 = $this->postJson(
            '/api/paystack-webhook',
            json_decode($payload, true),
            ['X-Paystack-Signature' => $signature]
        );
        $r1->assertStatus(200);

        // Second webhook call: order already processed — should also return 200 (no error)
        \Illuminate\Support\Facades\DB::shouldReceive('table')
            ->with('orders')
            ->andReturnSelf()
            ->shouldReceive('where')
            ->andReturnSelf()
            ->shouldReceive('first')
            ->andReturn((object)['order_id' => $orderId, 'processed' => 1]);

        $r2 = $this->postJson(
            '/api/paystack-webhook',
            json_decode($payload, true),
            ['X-Paystack-Signature' => $signature]
        );
        $r2->assertStatus(200); // idempotent — still 200, not 500
    }

    // ─── Prep-times read/write round-trip ─────────────────────────────────────

    public function test_prep_time_update_then_read_returns_new_value(): void
    {
        $menuId  = 42;
        $newTime = 25;

        // Write
        $fakeRecord = Mockery::mock(MenuPrepTime::class)->makePartial();
        $fakeRecord->menu_id           = $menuId;
        $fakeRecord->prep_time_minutes = $newTime;

        Mockery::mock('alias:' . MenuPrepTime::class)
               ->shouldReceive('updateOrCreate')
               ->with(['menu_id' => $menuId], ['prep_time_minutes' => $newTime])
               ->andReturn($fakeRecord);

        $writeResponse = $this->putJson("/api/cd/prep-times/{$menuId}", [
            'prep_time_minutes' => $newTime,
        ]);
        $writeResponse->assertStatus(200)
                      ->assertJsonPath('data.menu_id', $menuId)
                      ->assertJsonPath('data.prep_time_minutes', $newTime);

        // Read
        $collection = collect([(object)['menu_id' => $menuId, 'prep_time_minutes' => $newTime]]);

        Mockery::mock('alias:' . MenuPrepTime::class)
               ->shouldReceive('all')
               ->with(['menu_id', 'prep_time_minutes'])
               ->andReturn($collection);

        $readResponse = $this->getJson('/api/cd/prep-times');
        $readResponse->assertStatus(200)
                     ->assertJsonPath("data.{$menuId}", $newTime);
    }
}
