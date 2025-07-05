<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Province;
use App\Models\Regency;
use App\Models\Village;
use Illuminate\Http\Request;

class WilayahController extends Controller
{
    public function provinces()
    {
        return Province::all();
    }

    public function regencies(Request $request)
    {
        // Ambil kabupaten berdasarkan ID provinsi yang dikirim
        return Regency::where('province_id', $request->query('province_id'))->get();
    }

    public function districts(Request $request)
    {
        // Ambil kecamatan berdasarkan ID kabupaten yang dikirim
        return District::where('regency_id', $request->query('regency_id'))->get();
    }

    public function villages(Request $request)
    {
        // Ambil desa berdasarkan ID kecamatan yang dikirim
        return Village::where('district_id', $request->query('district_id'))->get();
    }
}