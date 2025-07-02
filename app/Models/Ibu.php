<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ibu extends Model
{
    use HasFactory;
    protected $guarded = [];

    // Relasi: Satu data Ibu bisa dimiliki oleh satu User (untuk login)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi: Satu data Ibu terdaftar di satu Posyandu
    public function posyandu()
    {
        return $this->belongsTo(Posyandu::class);
    }

    // Relasi: Satu Ibu bisa punya banyak Anak
    public function anaks()
    {
        return $this->hasMany(Anak::class);
    }

    public function riwayatPemeriksaanAnc()
    {
        return $this->hasMany(PemeriksaanAnc::class);
    }

    // Relasi: Satu Ibu punya banyak Riwayat Pemeriksaan PNC
    public function riwayatPemeriksaanPnc()
    {
        return $this->hasMany(PemeriksaanPnc::class);
    }
}
