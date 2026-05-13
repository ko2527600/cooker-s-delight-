<?php

namespace Tests\Feature;

use Tests\TestCase;
use Mockery;
use Illuminate\Support\Facades\Config;
use CookersDelight\TableSession\Models\DiningTable;
use CookersDelight\TableSession\Models\TableSession;
use CookersDelight\TableSession\Models\MenuPrepTime;

/**
 * Security Tests — verify that the API defends against common web threats
 * including HMAC bypass, injection, mass assignment, and improper auth.
 */
class SecurityTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─── HMAC signature enforcement ───────────────────────────────────────────

    public function test_paystack_webhook_without_signature_header_is_rejected(): void
    {
        $response = $this->postJson('/api/paystack-webhook', [
            'event' => 'charge.success',
            'data'  => ['reference' => 'CD-1-123', 'amount' => 5000],
        ]);

        $response->assertStatus(401);
    }

    public function test_paystack_webhook_with_empty_signature_is_rejected(): void
    {
        $response = $this->postJson(
            '/api/paystack-webhook',
            ['event' => 'charge.success', 'data' => []],
            ['X-Paystack-Signature' => '']
        );

        $response->assertStatus(401);
    }

    public function test_paystack_webhook_with_forged_signature_is_rejected(): void
    {
        Config::set('services.paystack.secret_key', 'real_secret');

        $payload   = json_encode(['event' => 'charge.success', 'data' => ['reference' => 'CD-1-1']]);
        $forged    = hash_hmac('sha512', $payload, 'wrong_secret'); // signed with wrong key

        $response = $this->postJson(
            '/api/paystack-webhook',
            json_decode($payload, true),
            ['X-Paystack-Signature' => $forged]
        );

        $response->assertStatus(401);
    }

    public function test_paystack_webhook_with_valid_signature_is_accepted(): void
    {
        $secret  = 'correct_secret';
        Config::set('services.paystack.secret_key', $secret);

        $payload   = json_encode(['event' => 'transfer.success', 'data' => []]);
        $signature = hash_hmac('sha512', $payload, $secret);

        $response = $this->postJson(
            '/api/paystack-webhook',
            json_decode($payload, true),
            ['X-Paystack-Signature' => $signature]
        );

        $response->assertStatus(200);
    }

    // ─── Path parameter injection ──────────────────────────────────────────────

    public function test_stable_token_with_sql_injection_string_is_handled(): void
    {
        // ModelNotFoundException (mapped to 404) rather than a SQL error
        Mockery::mock('alias:' . DiningTable::class)
               ->shouldReceive('where->with->where->firstOrFail')
               ->andThrow(new \Illuminate\Database\Eloquent\ModelNotFoundException());

        $sqli = urlencode("'; DROP TABLE cd_dining_tables; --");
        $response = $this->postJson("/api/table-sessions/by-table/{$sqli}");

        $this->assertNotEquals(500, $response->status(), 'SQL injection must not cause 500');
        $response->assertStatus(404);
    }

    public function test_session_token_with_xss_payload_is_handled(): void
    {
        Mockery::mock('alias:' . TableSession::class)
               ->shouldReceive('where->with->firstOrFail')
               ->andThrow(new \Illuminate\Database\Eloquent\ModelNotFoundException());

        $xss = urlencode('<script>alert(1)</script>');
        $response = $this->getJson("/api/table-sessions/{$xss}");

        $this->assertNotEquals(500, $response->status(), 'XSS in token must not cause 500');
        $response->assertStatus(404);
    }

    public function test_oversized_stable_token_does_not_cause_500(): void
    {
        Mockery::mock('alias:' . DiningTable::class)
               ->shouldReceive('where->with->where->firstOrFail')
               ->andThrow(new \Illuminate\Database\Eloquent\ModelNotFoundException());

        $oversizedToken = str_repeat('A', 10000);
        $response = $this->postJson("/api/table-sessions/by-table/{$oversizedToken}");

        $this->assertNotEquals(500, $response->status(), 'Oversized token must not cause 500');
    }

    // ─── Mass assignment protection ───────────────────────────────────────────

    public function test_place_order_ignores_extra_fields_in_body(): void
    {
        $session = Mockery::mock(TableSession::class)->makePartial();
        $session->shouldReceive('isValid')->andReturn(true);
        $session->order_id = null;
        $session->shouldReceive('update')->with(['order_id' => 10])->andReturn(true);
        $session->order_id = 10;

        Mockery::mock('alias:' . TableSession::class)
               ->shouldReceive('where->firstOrFail')
               ->andReturn($session);

        $response = $this->postJson('/api/table-sessions/some-token/order', [
            'order_id' => 10,
            'admin'    => true,       // attacker tries to set an admin flag
            'token'    => 'hack',     // attacker tries to overwrite token
            'closed_at'=> '2020-01-01', // attacker tries to close session
        ]);

        $response->assertStatus(200);
        // The controller only uses order_id — update() is called with only ['order_id' => 10]
    }

    // ─── Validation prevents invalid prep-time writes ─────────────────────────

    public function test_prep_time_update_rejects_non_integer(): void
    {
        $response = $this->putJson('/api/cd/prep-times/10', ['prep_time_minutes' => 'abc']);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['prep_time_minutes']);
    }

    public function test_prep_time_update_rejects_float(): void
    {
        $response = $this->putJson('/api/cd/prep-times/10', ['prep_time_minutes' => 15.5]);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['prep_time_minutes']);
    }

    public function test_prep_time_update_rejects_negative(): void
    {
        $response = $this->putJson('/api/cd/prep-times/10', ['prep_time_minutes' => -10]);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['prep_time_minutes']);
    }

    // ─── Response headers ─────────────────────────────────────────────────────

    public function test_prep_times_response_is_json_not_html(): void
    {
        Mockery::mock('alias:' . MenuPrepTime::class)
               ->shouldReceive('all')
               ->with(['menu_id', 'prep_time_minutes'])
               ->andReturn(collect([]));

        $response = $this->getJson('/api/cd/prep-times');
        $response->assertHeader('Content-Type', 'application/json');
    }
}
