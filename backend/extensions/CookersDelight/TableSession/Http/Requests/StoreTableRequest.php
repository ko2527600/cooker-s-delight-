<?php

namespace CookersDelight\TableSession\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Trick 04 — Reject early; spare the database.
 */
class StoreTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'location_id'  => ['required', 'integer', 'exists:locations,location_id'],
            'table_number' => ['required', 'integer', 'min:1'],
            'capacity'     => ['required', 'integer', 'min:1', 'max:50'],
        ];
    }
}
