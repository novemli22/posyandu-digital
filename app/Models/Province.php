<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    use HasFactory;

    /**
     * Izin Keamanan untuk Mass Assignment
     */
    protected $guarded = [];

    public function regencies()
    {
        return $this->hasMany(Regency::class);
    }

    public function regency()
    {
        return $this->belongsTo(Regency::class);
    }
}
