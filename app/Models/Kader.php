<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kader extends Model
{
    use HasFactory;
    protected $guarded = [];

    // Relasi: Satu Kader dimiliki oleh satu User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi: Satu Kader bertugas di satu Posyandu
    public function posyandu()
    {
        return $this->belongsTo(Posyandu::class);
    }
}
