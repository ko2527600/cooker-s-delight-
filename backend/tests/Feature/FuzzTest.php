<?php

namespace Tests\Feature;

use Tests\TestCase;
use Mockery;
use CookersDelight\TableSession\Models\DiningTable;
use CookersDelight\TableSession\Models\TableSession;
use CookersDelight\TableSession\Models\MenuPrepTime;

/**
 * Fuzz Tests — send unexpected, boundary, and malformed inputs to every API
 * endpoint to confirm they degrade gracefully (no 500s, no uncaught exceptions).
 */
class FuzzTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function notFoundMock(string $class): void
    {
        Mockery::mock('alias:' . $class)
               ->shouldReceive('where')->andReturnSelf()
               ->shouldReceive('with')->andReturnSelf()
               ->shouldReceive('firstOrFail')
               ->andThrow(new \Illuminate\Database\Eloquent\ModelNotFoundException());
    }

    // ─── stable token fuzz ────────────────────────────────────────────────────

    /**
     * @dataProvider stableTokenProvider
     */
    public function test_resolve_by_stable_token_never_returns_500(string $token): void
    {
        $this->notFoundMock(DiningTable::class);
        $response = $this->postJson('/api/table-sessions/by-table/' . urlencode($token));
        $this->assertNotEquals(500, $response->status(), "Token [{$token}] caused 500");
    }

    public static function stableTokenProvider(): array
    {
        return [
            'empty string'          => [''],
            'single space'          => [' '],
            'null byte'             => ["\x00"],
            'unicode emoji'         => ['🍕🍔🌮'],
            'sql injection'         => ["' OR 1=1 --"],
            'xss payload'           => ['<script>alert(1)</script>'],
            'very long token'       => [str_repeat('X', 5000)],
            'path traversal'        => ['../../etc/passwd'],
            'null word'             => ['null'],
            'numeric string'        => ['12345'],
            'uuid format'           => ['550e8400-e29b-41d4-a716-446655440000'],
            'json string'           => ['{"key":"value"}'],
            'newline in token'      => ["token\ninjection"],
            'carriage return'       => ["token\rinjection"],
        ];
    }

    // ─── session token fuzz ────────────────────────────────────────────────────

    /**
     * @dataProvider sessionTokenProvider
     */
    public function test_show_session_never_returns_500(string $token): void
    {
        $this->notFoundMock(TableSession::class);
        $response = $this->getJson('/api/table-sessions/' . urlencode($token));
        $this->assertNotEquals(500, $response->status(), "Session token [{$token}] caused 500");
    }

    public static function sessionTokenProvider(): array
    {
        return [
            'random chars'       => ['abc!@#$%^&*()'],
            'long numeric'       => [str_repeat('9', 255)],
            'html tag'           => ['<img src=x onerror=alert(1)>'],
            'ldap injection'     => ['*(uid=*))(|(uid=*'],
            'xml injection'      => ['<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>'],
            'command injection'  => ['token; rm -rf /'],
        ];
    }

    // ─── place order fuzz ─────────────────────────────────────────────────────

    /**
     * @dataProvider orderIdProvider
     */
    public function test_place_order_with_unexpected_order_id_never_returns_500(mixed $orderId): void
    {
        $session = Mockery::mock(TableSession::class)->makePartial();
        $session->shouldReceive('isValid')->andReturn(true);
        $session->order_id = null;
        $session->shouldReceive('update')->andReturn(true);

        Mockery::mock('alias:' . TableSession::class)
               ->shouldReceive('where->firstOrFail')
               ->andReturn($session);

        $response = $this->postJson('/api/table-sessions/any-token/order', ['order_id' => $orderId]);
        $this->assertNotEquals(500, $response->status(), "order_id [{$orderId}] caused 500");
    }

    public static function orderIdProvider(): array
    {
        return [
            'zero'             => [0],
            'negative'         => [-1],
            'float'            => [1.5],
            'string'           => ['abc'],
            'null'             => [null],
            'bool true'        => [true],
            'very large int'   => [PHP_INT_MAX],
            'array'            => [[]],
            'sql fragment'     => ["1; DROP TABLE orders"],
            'empty string'     => [''],
        ];
    }

    // ─── prep-time update fuzz ────────────────────────────────────────────────

    /**
     * @dataProvider prepTimeValueProvider
     */
    public function test_prep_time_update_with_bad_value_never_returns_500(mixed $value): void
    {
        $response = $this->putJson('/api/cd/prep-times/10', ['prep_time_minutes' => $value]);
        $this->assertNotEquals(500, $response->status(), "prep_time_minutes [{$value}] caused 500");
        $this->assertContains($response->status(), [200, 422], "Expected 200 or 422, got {$response->status()}");
    }

    public static function prepTimeValueProvider(): array
    {
        return [
            'zero'          => [0],
            'negative'      => [-1],
            'float'         => [5.5],
            'string alpha'  => ['abc'],
            'null'          => [null],
            'empty string'  => [''],
            'large number'  => [PHP_INT_MAX],
            'boolean'       => [false],
            'array'         => [[]],
            'sql'           => ["1; SELECT * FROM orders"],
        ];
    }

    // ─── webhook body fuzz ────────────────────────────────────────────────────

    public function test_paystack_webhook_with_empty_body_returns_401(): void
    {
        $response = $this->postJson('/api/paystack-webhook', []);
        // No valid signature → 401 before body is inspected
        $response->assertStatus(401);
    }

    public function test_paystack_webhook_with_missing_event_key_returns_200(): void
    {
        $secret  = 'fuzz_secret';
        \Illuminate\Support\Facades\Config::set('services.paystack.secret_key', $secret);

        $payload   = json_encode(['data' => []]); // no 'event' key
        $signature = hash_hmac('sha512', $payload, $secret);

        $response = $this->postJson(
            '/api/paystack-webhook',
            json_decode($payload, true),
            ['X-Paystack-Signature' => $signature]
        );
        // match(null → default → null) must not throw
        $response->assertStatus(200);
    }

    public function test_paystack_webhook_with_very_large_payload_does_not_crash(): void
    {
        $secret  = 'fuzz_secret2';
        \Illuminate\Support\Facades\Config::set('services.paystack.secret_key', $secret);

        $bigPayload = ['event' => 'junk', 'data' => array_fill(0, 1000, str_repeat('X', 100))];
        $encoded    = json_encode($bigPayload);
        $signature  = hash_hmac('sha512', $encoded, $secret);

        $response = $this->postJson(
            '/api/paystack-webhook',
            $bigPayload,
            ['X-Paystack-Signature' => $signature]
        );
        $response->assertStatus(200);
    }
}
