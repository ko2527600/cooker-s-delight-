<?php

namespace CookersDelight\TableSession\Http\Controllers;

use CookersDelight\TableSession\Models\DiningTable;
use CookersDelight\TableSession\Models\TableSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class TableSessionController extends Controller
{
    /**
     * Called when a customer scans the printed QR code.
     *
     * stable_token is the permanent token printed on the card.
     * This endpoint creates a fresh 4-hour session and returns the
     * ephemeral session_token that kawax uses for the rest of the flow.
     */
    public function resolveByStableToken(string $stableToken): JsonResponse
    {
        $table = DiningTable::where('stable_token', $stableToken)
            ->with('location')
            ->where('is_active', true)
            ->firstOrFail();

        $session = $table->createSession();

        return response()->json([
            'session_token' => $session->token,
            'table_number'  => $table->table_number,
            'location_id'   => $table->location_id,
            'location_name' => $table->location->location_name,
            'expires_at'    => $session->expires_at,
        ]);
    }

    /** Resolve an active session token and return table + location context. */
    public function show(string $token): JsonResponse
    {
        $session = TableSession::where('token', $token)
            ->with('table.location')
            ->firstOrFail();

        if (!$session->isValid()) {
            return response()->json(['error' => 'QR session has expired. Please ask a waiter for a new one.'], 410);
        }

        return response()->json([
            'token'         => $session->token,
            'table_number'  => $session->table->table_number,
            'location_id'   => $session->table->location_id,
            'location_name' => $session->table->location->location_name,
            'expires_at'    => $session->expires_at,
            'order_id'      => $session->order_id,
        ]);
    }

    /** Link an order_id to this session once kawax submits the order to TI. */
    public function placeOrder(string $token, Request $request): JsonResponse
    {
        $request->validate(['order_id' => 'required|integer']);

        $session = TableSession::where('token', $token)->firstOrFail();

        if (!$session->isValid()) {
            return response()->json(['error' => 'Session expired.'], 410);
        }

        if ($session->order_id) {
            return response()->json(['error' => 'Order already placed for this session.'], 409);
        }

        $session->update(['order_id' => $request->order_id]);

        return response()->json(['order_id' => $session->order_id, 'status' => 'linked']);
    }
}
