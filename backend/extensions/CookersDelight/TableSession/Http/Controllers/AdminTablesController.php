<?php

namespace CookersDelight\TableSession\Http\Controllers;

use CookersDelight\TableSession\Models\DiningTable;
use CookersDelight\TableSession\Models\TableSession;
use Igniter\Admin\Classes\AdminController;
use Illuminate\Http\Request;

/**
 * Admin dashboard for dining tables.
 *
 * Shows all tables across locations, their current session status,
 * the active order at each table, and provides a QR print page.
 */
class AdminTablesController extends AdminController
{
    public string $pageTitle = 'Tables & QR Codes';

    public function index()
    {
        $tables = DiningTable::with(['location', 'sessions' => function ($q) {
            $q->whereNull('closed_at')
              ->where('expires_at', '>', now())
              ->with('order')
              ->latest();
        }])->orderBy('location_id')->orderBy('table_number')->get();

        // Attach current session + order status to each table.
        $tables->each(function (DiningTable $table) {
            $table->active_session = $table->sessions->first();
        });

        return $this->makeView('tables/index', ['tables' => $tables]);
    }

    /** Printable QR code card for one table. */
    public function qrPrint(int $tableId)
    {
        $table = DiningTable::with('location')->findOrFail($tableId);

        return $this->makeView('tables/qr_print', ['table' => $table]);
    }

    /** Printable sheet with QR codes for all tables at one location. */
    public function qrPrintAll(Request $request)
    {
        $locationId = $request->query('location_id');

        $tables = DiningTable::with('location')
            ->when($locationId, fn ($q) => $q->where('location_id', $locationId))
            ->where('is_active', true)
            ->orderBy('location_id')
            ->orderBy('table_number')
            ->get();

        return $this->makeView('tables/qr_print_all', ['tables' => $tables]);
    }
}
