<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kader extends Model
{
    use HasFactory;

    /**
     * Izin agar semua kolom bisa diisi secara massal.
     * Aman karena kita melakukan validasi ketat di Controller.
     */
    protected $guarded = [];

    /**
     * Mengatur konversi tipe data otomatis.
     * Ini akan mengubah nilai 1/0 dari database menjadi true/false di kode.
     */
    protected $casts = [
        'memiliki_jkn' => 'boolean',
        'domisili_sesuai_ktp' => 'boolean',
        'pelatihan_posyandu' => 'boolean',
        'pelatihan_ibu_hamil' => 'boolean',
        'pelatihan_balita' => 'boolean',
    ];

    /**
     * Relasi: Satu Kader dimiliki oleh satu User (untuk login).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi: Satu Kader bertugas di satu Posyandu.
     */
    public function posyandu()
    {
        return $this->belongsTo(Posyandu::class);
    }

    /**
     * Relasi: Alamat KTP Kader menunjuk ke satu Desa.
     */
    public function ktpVillage()
    {
        return $this->belongsTo(Village::class, 'ktp_village_id');
    }

    /**
     * Relasi: Alamat Domisili Kader menunjuk ke satu Desa.
     */
    public function domisiliVillage()
    {
        return $this->belongsTo(Village::class, 'domisili_village_id');
    }
}