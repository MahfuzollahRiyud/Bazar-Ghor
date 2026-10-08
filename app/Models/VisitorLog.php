<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitorLog extends Model
{
    protected $fillable = [
        'visitor_id',
        'session_id',
        'page_path',
        'page_title',
        'device_type',
        'browser',
        'platform',
        'referer',
        'duration_seconds',
        'ip_address',
    ];

    protected $casts = [
        'duration_seconds' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
