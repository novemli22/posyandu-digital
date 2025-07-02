<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Posyandu extends Model
{
    use HasFactory;

    /**
     * Izin Keamanan untuk Mass Assignment
     */
    protected $guarded = [];

    public function village()
    {
        return $this->belongsTo(Village::class);
    }
}
