<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Anak extends Model
{
    use HasFactory;
    protected $guarded = [];

    // Relasi: Satu Anak dimiliki oleh satu Ibu
    public function ibu()
    {
        return $this->belongsTo(Ibu::class);
    }

    public function riwayatPemeriksaan()
    {
        return $this->hasMany(PemeriksaanAnak::class);
    }
}
