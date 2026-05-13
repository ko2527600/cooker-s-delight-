<?php

namespace CookersDelight\TableSession\Http\Controllers;

use CookersDelight\TableSession\Models\TableSession;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Server-Sent Events endpoint for real-time order status.
 *
 * Customer keeps this connection open; the server pushes updates as staff
 * change the order status in the TastyIgniter admin.
 *
 * No polling. No WebSocket server required. Works on a $12 VPS.
 *
 * Status flow: Pending → Received → Preparing → Ready → Served
 */
class OrderStatusStreamController extends Controller
{
    private const TERMINAL_STATUSES = ['Served', 'Cancelled'];
    private const POLL_INTERVAL_SECONDS = 3;
    private const MAX_DURATION_SECONDS = 3600; // 1 hour

    public function stream(Request $request, int $orderId): StreamedResponse
    {
        // SECURITY: Callers must prove they own this order by supplying the
        // ephemeral session_token that was linked to the order at placement.
        // This prevents unauthenticated users from enumerating order IDs and
        // monitoring other customers' order status.
        $sessionToken = $request->query('session_token');
        if (!$sessionToken) {
            abort(401, 'session_token query parameter is required.');
        }

        $session = TableSession::where('token', $sessionToken)
            ->where('order_id', $orderId)
            ->first();

        if (!$session) {
            abort(403, 'Session token does not match this order.');
        }

        return response()->stream(function () use ($orderId) {
            $start       = time();
            $lastStatus  = null;

            // Disable output buffering so events flush immediately.
            if (ob_get_level()) ob_end_clean();

            while (true) {
                if (connection_aborted()) break;
                if ((time() - $start) >= self::MAX_DURATION_SECONDS) break;

                $row = DB::table('orders')
                    ->join('statuses', 'orders.status_id', '=', 'statuses.status_id')
                    ->where('orders.order_id', $orderId)
                    ->select('statuses.status_name', 'statuses.status_color')
                    ->first();

                if (!$row) {
                    $this->sendEvent(['error' => 'Order not found'], 'error');
                    break;
                }

                if ($row->status_name !== $lastStatus) {
                    $lastStatus = $row->status_name;
                    $this->sendEvent([
                        'order_id'     => $orderId,
                        'status'       => $row->status_name,
                        'status_color' => $row->status_color,
                        'timestamp'    => now()->toISOString(),
                    ]);

                    if (in_array($row->status_name, self::TERMINAL_STATUSES)) {
                        $this->sendEvent(['done' => true], 'close');
                        break;
                    }
                }

                // Heartbeat to keep the connection alive through proxies.
                echo ": heartbeat\n\n";
                flush();

                sleep(self::POLL_INTERVAL_SECONDS);
            }
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache',
            'X-Accel-Buffering' => 'no', // disable Nginx buffering
            'Connection'        => 'keep-alive',
        ]);
    }

    private function sendEvent(array $data, string $event = 'status'): void
    {
        echo "event: {$event}\n";
        echo 'data: ' . json_encode($data) . "\n\n";
        flush();
    }
}
