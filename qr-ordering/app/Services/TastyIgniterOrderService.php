<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Thin bridge between kawax/self-ordering and TastyIgniter.
 *
 * Responsibilities:
 *   1. Authenticate to TI API
 *   2. Fetch menu items & categories (TI is source of truth)
 *   3. Submit order payload to TI
 *   4. Retrieve order status (polled by SSE endpoint on TI side)
 *   5. Attach table session metadata
 *   6. Normalize TI response payloads to kawax-compatible shapes
 *
 * This service must NOT:
 *   - Store menu data locally
 *   - Duplicate pricing or inventory logic
 *   - Maintain order state (TI owns that)
 */
class TastyIgniterOrderService
{
    private PendingRequest $http;

    public function __construct()
    {
        $this->http = Http::baseUrl(config('tastyigniter.api_url'))
            ->withToken(config('tastyigniter.api_token'))
            ->acceptJson()
            ->timeout(10)
            ->retry(3, 300);
    }

    // -------------------------------------------------------------------------
    // Menu
    // -------------------------------------------------------------------------

    /**
     * Fetch all categories and their menu items for a given location.
     * Returns the kawax-compatible menu shape:
     * [['category' => '...', 'menus' => [['name', 'price', 'description', 'image', 'options']]]]
     */
    public function fetchMenu(int $locationId): array
    {
        $categoriesResponse = $this->http->get('/categories', ['location' => $locationId]);
        $menusResponse      = $this->http->get('/menus', ['location' => $locationId, 'enabled' => true]);

        if ($categoriesResponse->failed() || $menusResponse->failed()) {
            Log::error('TI API: failed to fetch menu', [
                'categories_status' => $categoriesResponse->status(),
                'menus_status'      => $menusResponse->status(),
            ]);
            return [];
        }

        $categories = collect($categoriesResponse->json('data', []));
        $menus      = collect($menusResponse->json('data', []));

        return $categories->map(function ($cat) use ($menus) {
            $items = $menus->where('menu_category_id', $cat['id'] ?? $cat['category_id'] ?? null);

            return [
                'category' => $cat['name'],
                'menus'    => $items->map(fn ($m) => $this->normalizeMenuItem($m))->values()->all(),
            ];
        })->filter(fn ($cat) => !empty($cat['menus']))->values()->all();
    }

    private function normalizeMenuItem(array $item): array
    {
        return [
            'id'          => $item['id'] ?? $item['menu_id'],
            'name'        => $item['menu_name'],
            'description' => $item['menu_description'] ?? '',
            'price'       => (float) ($item['menu_price'] ?? 0),
            'image'       => $item['thumb'] ?? $item['media']['thumb'] ?? null,
            'options'     => $this->normalizeOptions($item['menu_options'] ?? []),
            'available'   => (bool) ($item['menu_status'] ?? true),
        ];
    }

    private function normalizeOptions(array $rawOptions): array
    {
        return collect($rawOptions)->map(fn ($opt) => [
            'id'       => $opt['menu_option_id'],
            'name'     => $opt['option']['display_name'] ?? $opt['option_name'] ?? '',
            'required' => (bool) ($opt['required'] ?? false),
            'min'      => $opt['min_selected'] ?? 0,
            'max'      => $opt['max_selected'] ?? 1,
            'values'   => collect($opt['option']['option_values'] ?? [])->map(fn ($v) => [
                'id'    => $v['menu_option_value_id'] ?? $v['id'],
                'name'  => $v['name'],
                'price' => (float) ($v['price'] ?? 0),
            ])->all(),
        ])->all();
    }

    // -------------------------------------------------------------------------
    // Orders
    // -------------------------------------------------------------------------

    /**
     * Submit a completed cart to TastyIgniter as a dine-in order.
     *
     * Returns ['order_id' => int, 'hash' => string] on success,
     * throws on failure.
     */
    public function submitOrder(array $cart, string $tableToken, string $customerName, string $customerEmail = ''): array
    {
        // Resolve table/location context from our TI extension.
        $sessionResponse = Http::baseUrl(config('app.backend_url'))
            ->get("/api/table-sessions/{$tableToken}");

        if ($sessionResponse->failed()) {
            throw new \RuntimeException('Invalid or expired QR session.');
        }

        $session    = $sessionResponse->json();
        $locationId = $session['location_id'];
        $tableNum   = $session['table_number'];

        $payload = [
            'location_id'     => $locationId,
            'order_type'      => 'dine-in',
            'first_name'      => $customerName,
            'email'           => $customerEmail,
            'comment'         => "Table {$tableNum}",
            'payment'         => 'paystack',
            'menu_items'      => $this->buildOrderItems($cart),
        ];

        $response = $this->http->post('/orders', $payload);

        if ($response->failed()) {
            Log::error('TI API: order submission failed', [
                'status'  => $response->status(),
                'body'    => $response->body(),
                'payload' => $payload,
            ]);
            throw new \RuntimeException('Failed to submit order: ' . $response->status());
        }

        $order = $response->json('data');

        // Link the TI order back to the QR session via our extension.
        Http::baseUrl(config('app.backend_url'))
            ->post("/api/table-sessions/{$tableToken}/order", ['order_id' => $order['order_id']]);

        return [
            'order_id' => $order['order_id'],
            'hash'     => $order['hash'] ?? null,
        ];
    }

    private function buildOrderItems(array $cart): array
    {
        return collect($cart)->map(fn ($item) => [
            'menu_id'     => $item['id'],
            'quantity'    => $item['quantity'],
            'comment'     => $item['note'] ?? '',
            'menu_options'=> collect($item['options'] ?? [])->map(fn ($opt) => [
                'menu_option_value_id' => $opt['value_id'],
            ])->all(),
        ])->all();
    }

    // -------------------------------------------------------------------------
    // Status
    // -------------------------------------------------------------------------

    /**
     * Get the current status of an order from TI.
     * Used as a fallback — the SSE endpoint on TI does the live streaming.
     */
    public function getOrderStatus(int $orderId): array
    {
        $response = $this->http->get("/orders/{$orderId}");

        if ($response->failed()) {
            return ['status' => 'unknown'];
        }

        $order = $response->json('data');

        return [
            'order_id' => $orderId,
            'status'   => $order['status']['status_name'] ?? 'Pending',
            'color'    => $order['status']['status_color'] ?? '#f59e0b',
        ];
    }
}
