<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Village extends Model
{
    use HasFactory;

    /**
     * Izin Keamanan untuk Mass Assignment
     */
    protected $guarded = [];

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function posyandus()
    {
        return $this->hasMany(Posyandu::class);
    }
}
