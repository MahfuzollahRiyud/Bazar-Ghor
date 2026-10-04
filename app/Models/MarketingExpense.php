<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketingExpense extends Model
{
    protected $fillable = [
        'expense_date',
        'amount',
        'title',
        'notes',
    ];

    protected $casts = [
        'expense_date' => 'date:Y-m-d',
        'amount' => 'decimal:2',
    ];
}
