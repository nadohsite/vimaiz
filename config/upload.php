<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Upload size limits (kilobytes, Laravel "max" rule)
    |--------------------------------------------------------------------------
    */

    'mission_photo_max_kb' => (int) env('UPLOAD_MISSION_PHOTO_MAX_KB', 102400), // 100 Mo

    'property_photo_max_kb' => (int) env('UPLOAD_PROPERTY_PHOTO_MAX_KB', 102400),

    'mission_photo_max_mb' => (int) env('UPLOAD_MISSION_PHOTO_MAX_MB', 100),

];
