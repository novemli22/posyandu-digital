<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class District extends Model
{
    use HasFactory;
    protected $guarded = [];

    /**
     * Relasi: Satu Kecamatan dimiliki oleh satu Kabupaten/Kota
     * INI FUNGSI YANG HILANG
     */
    public function regency()
    {
        return $this->belongsTo(Regency::class);
    }

    /**
     * Relasi: Satu Kecamatan punya banyak Desa/Kelurahan
     */
    public function villages()
    {
        return $this->hasMany(Village::class);
    }
}
