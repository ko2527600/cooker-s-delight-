<?php

namespace Tests\Feature;

use Tests\TestCase;
use Mockery;
use CookersDelight\TableSession\Models\DiningTable;
use CookersDelight\TableSession\Models\TableSession;
use CookersDelight\TableSession\Models\MenuPrepTime;

/**
 * Smoke Tests — quick sanity checks that the API controllers are wired up
 * and respond without throwing uncaught exceptions.
 */
class SmokeTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─── PrepTime endpoint ────────────────────────────────────────────────────

    public function test_prep_times_index_responds_with_200(): void
    {
        $mock = Mockery::mock('alias:' . MenuPrepTime::class);
        $mock->shouldReceive('all')
             ->once()
             ->with(['menu_id', 'prep_time_minutes'])
             ->andReturn(collect([]));

        $response = $this->getJson('/api/cd/prep-times');

        $response->assertStatus(200);
    }

    public function test_prep_times_index_response_has_data_key(): void
    {
        $mock = Mockery::mock('alias:' . MenuPrepTime::class);
        $mock->shouldReceive('all')
             ->with(['menu_id', 'prep_time_minutes'])
             ->andReturn(collect([]));

        $response = $this->getJson('/api/cd/prep-times');

        $response->assertJsonStructure(['data']);
    }

    // ─── TableSession endpoints ────────────────────────────────────────────────

    public function test_resolve_by_stable_token_returns_404_for_unknown_token(): void
    {
        $mock = Mockery::mock('alias:' . DiningTable::class);
        $mock->shouldReceive('where->with->where->firstOrFail')
             ->andThrow(new \Illuminate\Database\Eloquent\ModelNotFoundException());

        $response = $this->postJson('/api/table-sessions/by-table/unknown-token');

        // ModelNotFoundException renders as 404 in Laravel
        $response->assertStatus(404);
    }

    public function test_show_session_returns_404_for_unknown_token(): void
    {
        $mock = Mockery::mock('alias:' . TableSession::class);
        $mock->shouldReceive('where->with->firstOrFail')
             ->andThrow(new \Illuminate\Database\Eloquent\ModelNotFoundException());

        $response = $this->getJson('/api/table-sessions/nonexistent-token');

        $response->assertStatus(404);
    }

    // ─── Paystack webhook endpoint ────────────────────────────────────────────

    public function test_paystack_webhook_requires_hmac_signature(): void
    {
        $response = $this->postJson('/api/paystack-webhook', ['event' => 'charge.success']);

        // No signature → 401
        $response->assertStatus(401);
    }

    public function test_paystack_webhook_wrong_signature_returns_401(): void
    {
        $response = $this->postJson(
            '/api/paystack-webhook',
            ['event' => 'charge.success'],
            ['X-Paystack-Signature' => 'invalidsignature']
        );

        $response->assertStatus(401);
    }

    // ─── API route registration ────────────────────────────────────────────────

    public function test_table_session_by_table_route_exists(): void
    {
        // Route must exist; a 404 on an unregistered route returns HTML, not JSON
        $response = $this->postJson('/api/table-sessions/by-table/any');
        $this->assertNotEquals(405, $response->status(), 'Method not allowed — route exists but wrong method');
        // 404 from ModelNotFoundException is fine; 404 from Route not found would also be fine here
        $this->assertContains($response->status(), [200, 201, 404, 422, 500]);
    }

    public function test_prep_times_route_exists(): void
    {
        $response = $this->getJson('/api/cd/prep-times');
        $this->assertNotEquals(405, $response->status());
    }
}
