<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>QR Code – Table {{ $table->table_number }}</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }

        .card {
            width: 300px;
            border: 3px solid #EC4824;
            border-radius: 20px;
            overflow: hidden;
            text-align: center;
            box-shadow: 0 8px 40px rgba(236,72,36,0.15);
        }

        .card-header {
            background: #EC4824;
            color: #fff;
            padding: 16px;
        }

        .card-header .brand {
            font-size: 18px;
            font-weight: 900;
            letter-spacing: -0.5px;
            text-transform: uppercase;
        }

        .card-header .tagline {
            font-size: 10px;
            opacity: 0.85;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-top: 2px;
        }

        .qr-wrap {
            background: #fff;
            padding: 24px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Table number badge sits on top of the QR code */
        .table-badge {
            position: absolute;
            width: 56px;
            height: 56px;
            background: #EC4824;
            color: #fff;
            border-radius: 50%;
            font-size: 18px;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 12px rgba(236,72,36,0.4);
            z-index: 10;
            pointer-events: none;
        }

        .card-footer {
            background: #0d0d0d;
            color: #fff;
            padding: 14px 20px;
        }

        .card-footer .table-label {
            font-size: 28px;
            font-weight: 900;
            letter-spacing: -1px;
        }

        .card-footer .instruction {
            font-size: 11px;
            color: rgba(255,255,255,0.5);
            margin-top: 4px;
            line-height: 1.4;
        }

        .location-name {
            font-size: 10px;
            font-weight: 700;
            color: #EC4824;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-top: 6px;
        }

        @media print {
            body { min-height: auto; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>

<div>
    <div class="card">
        <div class="card-header">
            <div class="brand">Cookers <span style="opacity:0.7">Delight</span></div>
            <div class="tagline">Great Foods · Great People</div>
        </div>

        <div class="qr-wrap">
            {{-- QR code rendered by JS below --}}
            <div id="qrcode"></div>
            <div class="table-badge">{{ $table->table_number }}</div>
        </div>

        <div class="card-footer">
            <div class="table-label">Table {{ $table->table_number }}</div>
            <div class="instruction">Scan to browse the menu &amp; order</div>
            <div class="location-name">{{ $table->location->location_name }}</div>
        </div>
    </div>

    <div class="no-print" style="text-align:center; margin-top:20px;">
        <button onclick="window.print()"
                style="background:#EC4824;color:#fff;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-weight:700;font-size:14px;">
            🖨 Print This Card
        </button>
    </div>
</div>

<script>
    new QRCode(document.getElementById('qrcode'), {
        text: "{{ $table->qrUrl() }}",
        width: 220,
        height: 220,
        colorDark: "#0d0d0d",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,  // High error correction so badge doesn't break it
    });
</script>

</body>
</html>
