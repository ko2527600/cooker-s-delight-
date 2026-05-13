<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OrderStatusController extends Controller
{
    public function show(Request $request, int $orderId)
    {
        $backendUrl = config('tastyigniter.api_url');
        $sseUrl = rtrim(str_replace('/api', '', $backendUrl), '/') . "/api/orders/{$orderId}/status-stream";

        // Pull the estimated wait from session (set by PaystackDriver after order submit).
        $estimatedWaitMinutes = session('cd_estimated_wait_minutes');

        return view('order-status', compact('orderId', 'sseUrl', 'estimatedWaitMinutes'));
    }
}
