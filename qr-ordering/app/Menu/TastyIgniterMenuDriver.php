<?php

declare(strict_types=1);

namespace App\Menu;

use App\Services\TastyIgniterOrderService;
use Revolution\Ordering\Contracts\Menu\MenuDriver;
use Illuminate\Support\Facades\Cache;

/**
 * Kawax menu driver that pulls live data from TastyIgniter.
 * Registered in AppServiceProvider as the 'tastyigniter' driver.
 *
 * Menu data is cached for 5 minutes to avoid hammering TI on every page load,
 * but TI remains the single source of truth for pricing and availability.
 */
class TastyIgniterMenuDriver implements MenuDriver
{
    public function __construct(private TastyIgniterOrderService $ti) {}

    /**
     * Return menus in the kawax-expected structure:
     * [['category' => string, 'menus' => [...items]]]
     */
    public function get(): array
    {
        $locationId = (int) request()->query('location_id', config('tastyigniter.default_location_id', 1));

        return Cache::remember("ti_menu_{$locationId}", 300, fn () => $this->ti->fetchMenu($locationId));
    }
}
