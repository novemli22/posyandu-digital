<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class District extends Model
{
    use HasFactory;

    /**
     * Izin Keamanan untuk Mass Assignment
     */
    protected $guarded = [];

    public function villages()
    {
        return $this->hasMany(Village::class);
    }
}
