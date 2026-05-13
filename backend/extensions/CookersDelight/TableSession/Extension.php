<?php

namespace CookersDelight\TableSession;

use Igniter\System\Classes\BaseExtension;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;

class Extension extends BaseExtension
{
    public array $require = ['Igniter.Cart', 'Igniter.Api'];

    public function boot(): void
    {
        $this->registerMiddleware();
        $this->registerApiRoutes();
        $this->registerAdminRoutes();
        $this->registerSseRoute();
        $this->registerWebhookRoutes();
    }

    // -----------------------------------------------------------------------
    // Middleware registration
    // -----------------------------------------------------------------------

    protected function registerMiddleware(): void
    {
        /** @var Router $router */
        $router = app(Router::class);
        $router->aliasMiddleware(
            'admin.api',
            \CookersDelight\TableSession\Http\Middleware\AdminApiAuth::class
        );
    }

    // -----------------------------------------------------------------------
    // API routes (consumed by kawax and React site)
    // -----------------------------------------------------------------------

    protected function registerApiRoutes(): void
    {
        // QR table-session routes — public-facing; rate-limited to 60 req/min
        // to prevent brute-force enumeration of stable tokens.
        Route::prefix('api/table-sessions')
            ->middleware(['api', 'throttle:60,1'])
            ->group(function () {
                Route::post('/by-table/{stableToken}', [
                    \CookersDelight\TableSession\Http\Controllers\TableSessionController::class,
                    'resolveByStableToken',
                ]);
                Route::get('/{token}', [
                    \CookersDelight\TableSession\Http\Controllers\TableSessionController::class,
                    'show',
                ]);
                // Linking an order to a session is a write operation — also rate-limited.
                Route::post('/{token}/order', [
                    \CookersDelight\TableSession\Http\Controllers\TableSessionController::class,
                    'placeOrder',
                ]);
            });

        // Prep times — public GET is fine; PUT is admin-only and requires a valid admin token.
        Route::prefix('api/cd/prep-times')->group(function () {
            Route::get('/', [
                \CookersDelight\TableSession\Http\Controllers\PrepTimeController::class,
                'index',
            ])->middleware(['api', 'throttle:120,1']);

            Route::put('/{menuId}', [
                \CookersDelight\TableSession\Http\Controllers\PrepTimeController::class,
                'update',
            ])->middleware(['api', 'admin.api']);     // SECURITY: admin token required
        });

        // Settings — GET is intentionally public (no secrets stored here);
        // all writes are admin-only.
        Route::prefix('api/cd/settings')->middleware(['api'])->group(function () {
            Route::get('/', [
                \CookersDelight\TableSession\Http\Controllers\CdSettingsController::class,
                'index',
            ]);
            Route::put('/', [
                \CookersDelight\TableSession\Http\Controllers\CdSettingsController::class,
                'setMany',
            ])->middleware('admin.api');              // SECURITY: admin token required

            Route::put('/{key}', [
                \CookersDelight\TableSession\Http\Controllers\CdSettingsController::class,
                'set',
            ])->middleware('admin.api');              // SECURITY: admin token required
        });

        // Admin JSON API for React panel Tables page — all operations are admin-only.
        Route::prefix('api/admin/tables')
            ->middleware(['api', 'admin.api'])         // SECURITY: admin token required on all
            ->group(function () {
                Route::get('/', [
                    \CookersDelight\TableSession\Http\Controllers\AdminTablesApiController::class,
                    'index',
                ]);
                Route::post('/', [
                    \CookersDelight\TableSession\Http\Controllers\AdminTablesApiController::class,
                    'store',
                ]);
                Route::delete('/{id}', [
                    \CookersDelight\TableSession\Http\Controllers\AdminTablesApiController::class,
                    'destroy',
                ]);
                Route::get('/{id}/qr-print', [
                    \CookersDelight\TableSession\Http\Controllers\AdminTablesApiController::class,
                    'qrPrintUrl',
                ]);
            });
    }

    // -----------------------------------------------------------------------
    // Admin routes
    // -----------------------------------------------------------------------

    protected function registerAdminRoutes(): void
    {
        Route::prefix('admin/cookers_delight/table_session')
            ->middleware(['admin'])
            ->group(function () {
                Route::get('tables', [
                    \CookersDelight\TableSession\Http\Controllers\AdminTablesController::class,
                    'index',
                ])->name('cd.admin.tables');

                Route::get('tables/qr_print/{tableId}', [
                    \CookersDelight\TableSession\Http\Controllers\AdminTablesController::class,
                    'qrPrint',
                ])->name('cd.admin.tables.qr_print');

                Route::get('tables/qr_print_all', [
                    \CookersDelight\TableSession\Http\Controllers\AdminTablesController::class,
                    'qrPrintAll',
                ])->name('cd.admin.tables.qr_print_all');
            });
    }

    // -----------------------------------------------------------------------
    // SSE + Paystack
    // -----------------------------------------------------------------------

    protected function registerSseRoute(): void
    {
        // SECURITY: requires session_token query param so callers can only
        // stream orders that belong to their own table session.
        // Rate-limited: one SSE connection per IP per minute (mitigates DoS via
        // open-connection flooding).
        Route::get('api/orders/{orderId}/status-stream', [
            \CookersDelight\TableSession\Http\Controllers\OrderStatusStreamController::class,
            'stream',
        ])->middleware(['api', 'throttle:10,1']);
    }

    protected function registerWebhookRoutes(): void
    {
        Route::post('webhooks/paystack', [
            \CookersDelight\TableSession\Http\Controllers\PaystackWebhookController::class,
            'handle',
        ])->middleware(['api']);
    }

    // -----------------------------------------------------------------------
    // Admin navigation
    // -----------------------------------------------------------------------

    public function registerNavigation(): array
    {
        return [
            'cookers_tables' => [
                'label'        => 'Tables & QR',
                'iconCssClass' => 'fa fa-qrcode',
                'url'          => admin_url('cookers_delight/table_session/tables'),
                'priority'     => 200,
                'child'        => [
                    'tables' => [
                        'label'    => 'Table Dashboard',
                        'url'      => admin_url('cookers_delight/table_session/tables'),
                        'priority' => 1,
                    ],
                    'print_all' => [
                        'label'    => 'Print All QR Codes',
                        'url'      => admin_url('cookers_delight/table_session/tables/qr_print_all'),
                        'priority' => 2,
                    ],
                ],
            ],
        ];
    }
}
