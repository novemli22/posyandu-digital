<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PemeriksaanAnak extends Model
{
    use HasFactory;
    protected $guarded = [];

    // Relasi: Dimiliki oleh satu Anak
    public function anak()
    {
        return $this->belongsTo(Anak::class);
    }

    // Relasi: Dicatat oleh satu Kader
    public function kader()
    {
        return $this->belongsTo(Kader::class);
    }
}