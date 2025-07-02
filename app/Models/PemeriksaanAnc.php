<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PemeriksaanAnc extends Model
{
    use HasFactory;
    protected $guarded = [];

    // Relasi: Dimiliki oleh satu Ibu
    public function ibu()
    {
        return $this->belongsTo(Ibu::class);
    }

    // Relasi: Dicatat oleh satu Kader
    public function kader()
    {
        return $this->belongsTo(Kader::class);
    }
}