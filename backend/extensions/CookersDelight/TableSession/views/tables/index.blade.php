@extends('igniter.admin::layouts.default')

@section('title', 'Tables & QR Codes')

@section('toolbar')
    <div class="flex items-center gap-3 mb-6">
        <a href="{{ admin_url('cookers_delight/table_session/tables/qr_print_all') }}"
           target="_blank"
           class="btn btn-secondary">
            <i class="fa fa-print me-2"></i> Print All QR Codes
        </a>
    </div>
@endsection

@section('content')
<div class="container-fluid">

    {{-- Group tables by location --}}
    @foreach ($tables->groupBy('location_id') as $locationId => $locationTables)
    @php $location = $locationTables->first()->location; @endphp

    <div class="card mb-6">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
                <i class="fa fa-map-marker-alt me-2 text-orange"></i>
                {{ $location->location_name }}
            </h5>
            <a href="{{ admin_url('cookers_delight/table_session/tables/qr_print_all?location_id=' . $locationId) }}"
               target="_blank" class="btn btn-sm btn-outline-secondary">
                <i class="fa fa-print me-1"></i> Print Location QRs
            </a>
        </div>

        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="table-dark">
                        <tr>
                            <th style="width:80px">Table #</th>
                            <th style="width:80px">Seats</th>
                            <th>Status</th>
                            <th>Current Order</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Order Status</th>
                            <th style="width:120px">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($locationTables as $table)
                        @php
                            $session = $table->active_session;
                            $order   = $session?->order ?? null;
                        @endphp
                        <tr>
                            <td>
                                <span class="fw-bold fs-5">T{{ $table->table_number }}</span>
                            </td>
                            <td>{{ $table->capacity }}</td>

                            {{-- Table occupancy status --}}
                            <td>
                                @if ($session)
                                    <span class="badge bg-warning text-dark">
                                        <i class="fa fa-user me-1"></i> Occupied
                                    </span>
                                    <small class="d-block text-muted mt-1">
                                        Session expires {{ $session->expires_at->diffForHumans() }}
                                    </small>
                                @else
                                    <span class="badge bg-success">
                                        <i class="fa fa-check me-1"></i> Available
                                    </span>
                                @endif
                            </td>

                            {{-- Order details --}}
                            <td>
                                @if ($order)
                                    <a href="{{ admin_url('orders/edit/' . $order->order_id) }}" class="fw-bold">
                                        #{{ $order->order_id }}
                                    </a>
                                @elseif ($session)
                                    <span class="text-muted fst-italic">Browsing menu…</span>
                                @else
                                    <span class="text-muted">—</span>
                                @endif
                            </td>

                            <td>
                                @if ($order)
                                    {{ $order->first_name }} {{ $order->last_name }}
                                    @if ($order->email)
                                        <small class="d-block text-muted">{{ $order->email }}</small>
                                    @endif
                                @else
                                    <span class="text-muted">—</span>
                                @endif
                            </td>

                            <td>
                                @if ($order)
                                    <span class="fw-bold text-success">₵{{ number_format($order->order_total, 2) }}</span>
                                @else
                                    <span class="text-muted">—</span>
                                @endif
                            </td>

                            <td>
                                @if ($order)
                                    @php $status = $order->status; @endphp
                                    <span class="badge"
                                          style="background-color: {{ $status->status_color ?? '#6c757d' }}">
                                        {{ $status->status_name ?? 'Unknown' }}
                                    </span>
                                @else
                                    <span class="text-muted">—</span>
                                @endif
                            </td>

                            <td>
                                <a href="{{ admin_url('cookers_delight/table_session/tables/qr_print/' . $table->id) }}"
                                   target="_blank"
                                   class="btn btn-sm btn-outline-primary"
                                   title="Print QR Code">
                                    <i class="fa fa-qrcode"></i>
                                </a>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    @endforeach

</div>
@endsection
