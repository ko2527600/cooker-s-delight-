<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order #{{ $orderId }} – Cookers Delight</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root { --brand-orange: #EC4824; --brand-black: #1a1a1a; }
        .status-dot { width:12px; height:12px; border-radius:50%; display:inline-block; }
    </style>
</head>
<body class="bg-gray-950 text-white min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-sm text-center space-y-8">

        <div class="space-y-2">
            <img src="/images/logo.png" alt="Cookers Delight" class="h-12 mx-auto" onerror="this.style.display='none'">
            <h1 class="text-xl font-bold" style="color:var(--brand-orange)">Order #{{ $orderId }}</h1>
            <p class="text-gray-400 text-sm">Live status updates — no refresh needed</p>
        </div>

        <!-- Status display -->
        <div id="status-card" class="bg-gray-900 rounded-2xl p-8 space-y-4 shadow-xl">
            <div id="status-dot" class="status-dot mx-auto animate-pulse bg-yellow-500"></div>
            <p id="status-text" class="text-2xl font-bold">Pending</p>
            <p id="status-sub" class="text-gray-400 text-sm">Waiting for payment confirmation…</p>
        </div>

        <!-- Steps -->
        <div class="grid grid-cols-4 gap-1 text-xs text-gray-500">
            @foreach(['Received','Preparing','Ready','Served'] as $step)
            <div id="step-{{ strtolower($step) }}" class="flex flex-col items-center gap-1 opacity-40">
                <div class="w-2 h-2 rounded-full bg-gray-600"></div>
                <span>{{ $step }}</span>
            </div>
            @endforeach
        </div>

        <p id="done-msg" class="hidden text-green-400 font-semibold">
            ✓ Your food has been served. Enjoy your meal!
        </p>
    </div>

<script>
const sseUrl   = @json($sseUrl);
const steps    = ['received','preparing','ready','served'];
const messages = {
    Pending:   'Waiting for payment confirmation…',
    Received:  'Order received! Kitchen is getting ready.',
    Preparing: 'Chefs are cooking your food now.',
    Ready:     'Your order is ready! Waiter is on the way.',
    Served:    'Enjoy your meal!',
    Cancelled: 'Your order was cancelled. Please speak to staff.',
};

const source = new EventSource(sseUrl);

source.addEventListener('status', (e) => {
    const { status, status_color } = JSON.parse(e.data);
    document.getElementById('status-text').textContent = status;
    document.getElementById('status-sub').textContent  = messages[status] ?? '';
    document.getElementById('status-dot').style.backgroundColor = status_color;

    // Illuminate steps
    steps.forEach((s, i) => {
        const el = document.getElementById('step-' + s);
        if (el) el.classList.toggle('opacity-100', steps.indexOf(status.toLowerCase()) >= i);
    });
});

source.addEventListener('close', () => {
    source.close();
    document.getElementById('done-msg').classList.remove('hidden');
});

source.addEventListener('error', () => {
    document.getElementById('status-sub').textContent = 'Connection lost. Please refresh the page.';
});
</script>
</body>
</html>
