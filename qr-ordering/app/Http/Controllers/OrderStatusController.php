<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OrderStatusController extends Controller
{
    public function show(Request $request, int $orderId)
    {
        $backendUrl = config('tastyigniter.api_url');
        // Strip /api suffix to get base URL for SSE endpoint.
        $sseUrl = rtrim(str_replace('/api', '', $backendUrl), '/') . "/api/orders/{$orderId}/status-stream";

        return view('order-status', compact('orderId', 'sseUrl'));
    }
}
