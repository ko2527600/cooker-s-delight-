<?php

namespace CookersDelight\TableSession\Http\Controllers;

use CookersDelight\TableSession\Models\MenuPrepTime;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

/**
 * Public API for menu item prep times.
 * Kawax and the React site fetch this to show estimated wait times.
 */
class PrepTimeController extends Controller
{
    /** GET /api/cd/prep-times — returns all prep times keyed by menu_id */
    public function index(): JsonResponse
    {
        $times = MenuPrepTime::all(['menu_id', 'prep_time_minutes']);

        return response()->json([
            'data' => $times->keyBy('menu_id')->map->prep_time_minutes,
        ]);
    }

    /** PUT /api/cd/prep-times/{menuId} — admin updates one item's prep time */
    public function update(Request $request, int $menuId): JsonResponse
    {
        $request->validate(['prep_time_minutes' => 'required|integer|min:1|max:120']);

        $record = MenuPrepTime::updateOrCreate(
            ['menu_id' => $menuId],
            ['prep_time_minutes' => $request->prep_time_minutes]
        );

        return response()->json(['data' => $record]);
    }
}
