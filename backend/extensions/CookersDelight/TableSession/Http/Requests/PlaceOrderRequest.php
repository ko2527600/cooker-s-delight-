<?php

namespace CookersDelight\TableSession\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Trick 04 — Reject early; spare the database.
 *
 * A bad request that reaches the database is a tax you pay forever.
 * Schema-validate at the controller boundary, not at the table.
 */
class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['required', 'integer', 'min:1'],
        ];
    }
}
