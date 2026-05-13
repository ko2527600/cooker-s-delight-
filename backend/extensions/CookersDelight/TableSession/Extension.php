<?php

namespace CookersDelight\TableSession;

use Igniter\System\Classes\BaseExtension;
use Illuminate\Support\Facades\Route;

class Extension extends BaseExtension
{
    public array $require = ['Igniter.Cart', 'Igniter.Api'];

    public function boot(): void
    {
        $this->registerApiRoutes();
        $this->registerAdminRoutes();
        $this->registerSseRoute();
        $this->registerWebhookRoutes();
    }

    // -----------------------------------------------------------------------
    // API routes (consumed by kawax and React site)
    // -----------------------------------------------------------------------

    protected function registerApiRoutes(): void
    {
        Route::prefix('api/table-sessions')
            ->middleware(['api'])
            ->group(function () {
                // Resolve printed QR stable token → create a fresh session
                Route::post('/by-table/{stableToken}', [
                    \CookersDelight\TableSession\Http\Controllers\TableSessionController::class,
                    'resolveByStableToken',
                ]);
                // Inspect an active session by its ephemeral token
                Route::get('/{token}', [
                    \CookersDelight\TableSession\Http\Controllers\TableSessionController::class,
                    'show',
                ]);
                // Link a TI order_id back to the session
                Route::post('/{token}/order', [
                    \CookersDelight\TableSession\Http\Controllers\TableSessionController::class,
                    'placeOrder',
                ]);
            });

        // Prep times — public read, admin-authenticated write
        Route::prefix('api/cd/prep-times')->group(function () {
            Route::get('/', [
                \CookersDelight\TableSession\Http\Controllers\PrepTimeController::class,
                'index',
            ])->middleware(['api']);

            Route::put('/{menuId}', [
                \CookersDelight\TableSession\Http\Controllers\PrepTimeController::class,
                'update',
            ])->middleware(['api']);
        });

        // Custom settings key-value store (React admin panel)
        Route::prefix('api/cd/settings')->middleware(['api'])->group(function () {
            Route::get('/', [
                \CookersDelight\TableSession\Http\Controllers\CdSettingsController::class,
                'index',
            ]);
            Route::put('/', [
                \CookersDelight\TableSession\Http\Controllers\CdSettingsController::class,
                'setMany',
            ]);
            Route::put('/{key}', [
                \CookersDelight\TableSession\Http\Controllers\CdSettingsController::class,
                'set',
            ]);
        });

        // Admin JSON API for React panel Tables page
        Route::prefix('api/admin/tables')->middleware(['api'])->group(function () {
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
        Route::get('api/orders/{orderId}/status-stream', [
            \CookersDelight\TableSession\Http\Controllers\OrderStatusStreamController::class,
            'stream',
        ])->middleware(['api']);
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
