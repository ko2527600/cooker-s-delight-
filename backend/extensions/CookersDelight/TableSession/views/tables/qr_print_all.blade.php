<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>QR Codes – All Tables</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background: #f5f5f5;
            padding: 24px;
        }

        h2 {
            text-align: center;
            margin-bottom: 24px;
            color: #0d0d0d;
            font-size: 20px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 24px;
            max-width: 1100px;
            margin: 0 auto;
        }

        .card {
            border: 2px solid #EC4824;
            border-radius: 16px;
            overflow: hidden;
            background: #fff;
            text-align: center;
        }

        .card-header {
            background: #EC4824;
            color: #fff;
            padding: 10px;
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .qr-wrap {
            padding: 16px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .table-badge {
            position: absolute;
            width: 44px;
            height: 44px;
            background: #EC4824;
            color: #fff;
            border-radius: 50%;
            font-size: 15px;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(236,72,36,0.4);
            z-index: 10;
        }

        .card-footer {
            background: #0d0d0d;
            color: #fff;
            padding: 10px;
            font-size: 22px;
            font-weight: 900;
        }

        .card-footer small {
            display: block;
            font-size: 9px;
            color: rgba(255,255,255,0.45);
            margin-top: 2px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .no-print {
            text-align: center;
            margin-bottom: 20px;
        }

        @media print {
            body { background: #fff; padding: 8px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>

<div class="no-print">
    <button onclick="window.print()"
            style="background:#EC4824;color:#fff;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-weight:700;font-size:14px;">
        🖨 Print All QR Codes
    </button>
</div>

<h2>Cookers Delight — Table QR Codes</h2>

<div class="grid">
    @foreach ($tables as $table)
    <div class="card">
        <div class="card-header">{{ $table->location->location_name }}</div>
        <div class="qr-wrap">
            <div id="qr-{{ $table->id }}"></div>
            <div class="table-badge">{{ $table->table_number }}</div>
        </div>
        <div class="card-footer">
            Table {{ $table->table_number }}
            <small>Scan to order</small>
        </div>
    </div>
    @endforeach
</div>

<script>
    const tables = @json($tables->map(fn($t) => ['id' => $t->id, 'url' => $t->qrUrl()]));
    tables.forEach(t => {
        new QRCode(document.getElementById('qr-' + t.id), {
            text: t.url,
            width: 160,
            height: 160,
            colorDark: '#0d0d0d',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H,
        });
    });
</script>

</body>
</html>
