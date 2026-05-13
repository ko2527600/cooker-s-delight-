<?php

return [
    'api_url'             => env('TI_API_URL', 'http://localhost:8000/api'),
    'api_token'           => env('TI_API_TOKEN', ''),
    'default_location_id' => (int) env('TI_DEFAULT_LOCATION_ID', 1),
];
