<?php

namespace CookersDelight\TableSession\Http\Controllers;

use CookersDelight\TableSession\Http\Requests\StoreTableRequest;
use CookersDelight\TableSession\Models\DiningTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * JSON API for the React admin panel's Tables page.
 *
 * Distinct from AdminTablesController which serves Blade views for TI's own admin.
 *
 * GET    /api/admin/tables           list all tables grouped by location
 * POST   /api/admin/tables           create a new table
 * DELETE /api/admin/tables/{id}      delete a table (only if no active session)
 * GET    /api/admin/tables/{id}/qr-print  returns the stable QR URL for JS to print
 */
class AdminTablesApiController extends Controller
{
    public function index(): JsonResponse
    {
        $tables = DiningTable::with([
            'location:location_id,location_name',
            'sessions' => fn ($q) => $q
                ->whereNull('closed_at')
                ->where('expires_at', '>', now())
                ->with('order:order_id,order_total,status_id')
                ->latest()
                ->limit(1),
        ])
        ->orderBy('location_id')
        ->orderBy('table_number')
        ->get();

        // Shape each table and attach the active session/order summary.
        $shaped = $tables->map(function (DiningTable $table) {
            $session = $table->sessions->first();
            $order   = $session?->order;

            $activeSession = $session ? [
                'session_token' => $session->session_token,
                'order_id'      => $order?->order_id,
                'amount'        => $order ? number_format($order->order_total, 2) : null,
                'status'        => $order?->status_id,
            ] : null;

            return [
                'table_id'       => $table->table_id,
                'table_number'   => $table->table_number,
                'capacity'       => $table->capacity,
                'stable_token'   => $table->stable_token,
                'location_id'    => $table->location_id,
                'location_name'  => $table->location->location_name ?? 'Unknown',
                'active_session' => $activeSession,
            ];
        });

        // Group by location for the location-tab UI.
        $grouped = $shaped->groupBy('location_id')->map(fn ($rows) => [
            'location_id'   => $rows->first()['location_id'],
            'location_name' => $rows->first()['location_name'],
            'tables'        => $rows->values(),
        ])->values();

        return response()->json(['data' => $grouped]);
    }

    public function store(StoreTableRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Reject duplicate table numbers within the same location.
        $exists = DiningTable::where('location_id', $validated['location_id'])
            ->where('table_number', $validated['table_number'])
            ->exists();

        if ($exists) {
            return response()->json(
                ['message' => 'Table ' . $validated['table_number'] . ' already exists at this location.'],
                422
            );
        }

        $table = DiningTable::create([
            'location_id'  => $validated['location_id'],
            'table_number' => $validated['table_number'],
            'capacity'     => $validated['capacity'],
            'stable_token' => Str::uuid(),
            'is_active'    => true,
        ]);

        return response()->json(['data' => $table], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $table = DiningTable::findOrFail($id);

        $hasActiveSession = $table->sessions()
            ->whereNull('closed_at')
            ->where('expires_at', '>', now())
            ->exists();

        if ($hasActiveSession) {
            return response()->json(
                ['message' => 'Cannot delete a table with an active session. Close the session first.'],
                422
            );
        }

        $table->delete();

        return response()->json(['message' => 'Table deleted.']);
    }

    public function qrPrintUrl(int $id): JsonResponse
    {
        $table  = DiningTable::with('location')->findOrFail($id);
        $qrUrl  = $table->qrUrl();

        return response()->json([
            'data' => [
                'table_id'     => $table->table_id,
                'table_number' => $table->table_number,
                'location'     => $table->location->location_name ?? '',
                'qr_url'       => $qrUrl,
            ],
        ]);
    }
}
