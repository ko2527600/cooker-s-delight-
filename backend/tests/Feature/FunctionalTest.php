<?php

namespace Tests\Feature;

use Tests\TestCase;
use Mockery;
use Illuminate\Support\Facades\Config;
use CookersDelight\TableSession\Models\DiningTable;
use CookersDelight\TableSession\Models\TableSession;
use CookersDelight\TableSession\Models\MenuPrepTime;

/**
 * Functional Tests — verify that each controller action returns the correct
 * data shape and HTTP status for valid inputs.
 */
class FunctionalTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─── PrepTimeController ────────────────────────────────────────────────────

    public function test_prep_times_index_returns_map_keyed_by_menu_id(): void
    {
        $fakeRecords = collect([
            (object)['menu_id' => 10, 'prep_time_minutes' => 20],
            (object)['menu_id' => 11, 'prep_time_minutes' => 15],
        ]);

        $mock = Mockery::mock('alias:' . MenuPrepTime::class);
        $mock->shouldReceive('all')
             ->with(['menu_id', 'prep_time_minutes'])
             ->andReturn($fakeRecords);

        $response = $this->getJson('/api/cd/prep-times');
        $response->assertStatus(200)
                 ->assertJsonStructure(['data'])
                 ->assertJsonPath('data.10', 20)
                 ->assertJsonPath('data.11', 15);
    }

    public function test_prep_times_update_validates_min_1(): void
    {
        $response = $this->putJson('/api/cd/prep-times/10', ['prep_time_minutes' => 0]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['prep_time_minutes']);
    }

    public function test_prep_times_update_validates_max_120(): void
    {
        $response = $this->putJson('/api/cd/prep-times/10', ['prep_time_minutes' => 121]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['prep_time_minutes']);
    }

    public function test_prep_times_update_validates_required(): void
    {
        $response = $this->putJson('/api/cd/prep-times/10', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['prep_time_minutes']);
    }

    // ─── TableSessionController — placeOrder ──────────────────────────────────

    public function test_place_order_validates_order_id_required(): void
    {
        // Session must "exist" for the controller to reach validation
        $fakeSession = Mockery::mock(TableSession::class)->makePartial();
        $fakeSession->shouldReceive('isValid')->andReturn(true);
        $fakeSession->order_id = null;
        $fakeSession->shouldReceive('update')->andReturn(true);

        Mockery::mock('alias:' . TableSession::class)
               ->shouldReceive('where->firstOrFail')
               ->andReturn($fakeSession);

        $response = $this->postJson('/api/table-sessions/valid-token/order', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['order_id']);
    }

    public function test_place_order_returns_409_when_order_already_linked(): void
    {
        $fakeSession = Mockery::mock(TableSession::class)->makePartial();
        $fakeSession->shouldReceive('isValid')->andReturn(true);
        $fakeSession->order_id = 42; // already linked

        Mockery::mock('alias:' . TableSession::class)
               ->shouldReceive('where->firstOrFail')
               ->andReturn($fakeSession);

        $response = $this->postJson('/api/table-sessions/used-token/order', ['order_id' => 99]);

        $response->assertStatus(409)
                 ->assertJsonPath('error', 'Order already placed for this session.');
    }

    public function test_place_order_returns_410_when_session_expired(): void
    {
        $fakeSession = Mockery::mock(TableSession::class)->makePartial();
        $fakeSession->shouldReceive('isValid')->andReturn(false);
        $fakeSession->order_id = null;

        Mockery::mock('alias:' . TableSession::class)
               ->shouldReceive('where->firstOrFail')
               ->andReturn($fakeSession);

        $response = $this->postJson('/api/table-sessions/expired-token/order', ['order_id' => 5]);

        $response->assertStatus(410)
                 ->assertJsonPath('error', 'Session expired.');
    }

    // ─── TableSessionController — show ────────────────────────────────────────

    public function test_show_returns_410_when_session_is_expired(): void
    {
        $fakeLocation = (object)['location_name' => 'Osu'];
        $fakeTable = (object)['table_number' => '3', 'location_id' => 1, 'location' => $fakeLocation];

        $fakeSession = Mockery::mock(TableSession::class)->makePartial();
        $fakeSession->shouldReceive('isValid')->andReturn(false);
        $fakeSession->token    = 'expired-token';
        $fakeSession->table    = $fakeTable;
        $fakeSession->order_id = null;

        Mockery::mock('alias:' . TableSession::class)
               ->shouldReceive('where->with->firstOrFail')
               ->andReturn($fakeSession);

        $response = $this->getJson('/api/table-sessions/expired-token');

        $response->assertStatus(410)
                 ->assertJsonPath('error', 'QR session has expired. Please ask a waiter for a new one.');
    }

    public function test_show_returns_session_data_for_valid_token(): void
    {
        $fakeLocation = Mockery::mock();
        $fakeLocation->location_name = 'Osu Branch';

        $fakeTable = Mockery::mock();
        $fakeTable->table_number = '5';
        $fakeTable->location_id  = 1;
        $fakeTable->location     = $fakeLocation;

        $fakeSession = Mockery::mock(TableSession::class)->makePartial();
        $fakeSession->shouldReceive('isValid')->andReturn(true);
        $fakeSession->token      = 'valid-uuid-token';
        $fakeSession->table      = $fakeTable;
        $fakeSession->order_id   = null;
        $fakeSession->expires_at = now()->addHours(2);

        Mockery::mock('alias:' . TableSession::class)
               ->shouldReceive('where->with->firstOrFail')
               ->andReturn($fakeSession);

        $response = $this->getJson('/api/table-sessions/valid-uuid-token');

        $response->assertStatus(200)
                 ->assertJsonStructure(['token', 'table_number', 'location_id', 'location_name', 'expires_at', 'order_id']);
    }

    // ─── PaystackWebhookController ─────────────────────────────────────────────

    public function test_paystack_webhook_returns_200_for_unknown_events(): void
    {
        $secret  = 'test_secret';
        Config::set('services.paystack.secret_key', $secret);

        $payload   = json_encode(['event' => 'unknown_event', 'data' => []]);
        $signature = hash_hmac('sha512', $payload, $secret);

        $response = $this->postJson(
            '/api/paystack-webhook',
            json_decode($payload, true),
            ['X-Paystack-Signature' => $signature]
        );

        $response->assertStatus(200);
    }
}
