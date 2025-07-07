<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anak;
use App\Models\Ibu;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AnakController extends Controller
{
    public function index()
    {
        return Anak::with(['ibu', 'posyandu'])->latest()->get();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'is_ibu_terdaftar' => ['required', 'boolean'],

            // Validasi jika Ibu SUDAH terdaftar
            'ibu_id' => ['exclude_if:is_ibu_terdaftar,false', 'required', 'exists:ibus,id'],

            // Validasi jika Ibu BELUM terdaftar (diinput manual)
            'nama_ibu_manual' => ['exclude_if:is_ibu_terdaftar,true', 'required', 'string', 'max:255'],
            'nik_ibu_manual' => ['exclude_if:is_ibu_terdaftar,true', 'nullable', 'string', 'size:16'],
            'posyandu_id' => ['exclude_if:is_ibu_terdaftar,true', 'required', 'exists:posyandus,id'],
            'alamat_lengkap_manual' => ['exclude_if:is_ibu_terdaftar,true', 'required', 'string'],
            'rt_manual' => ['exclude_if:is_ibu_terdaftar,true', 'required', 'string', 'max:3'],
            'rw_manual' => ['exclude_if:is_ibu_terdaftar,true', 'required', 'string', 'max:3'],

            // Validasi data anak (selalu wajib)
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'is_nik_exists' => ['required', 'boolean'],
            'nik' => ['exclude_if:is_nik_exists,false', 'required', 'string', 'size:16', Rule::unique('anaks', 'nik'), Rule::unique('ibus', 'nik'), Rule::unique('kaders', 'nik')],
            'nomor_kk' => ['exclude_if:is_nik_exists,false', 'required', 'string', 'max:20'],
            'anak_ke' => ['required', 'integer', 'min:1'],
            'tanggal_lahir' => ['required', 'date'],
            'jenis_kelamin' => ['required', 'in:LAKI-LAKI,PEREMPUAN'],
            'bb_lahir' => ['required', 'numeric'],
            'pb_lahir' => ['required', 'numeric'],
            'punya_buku_kia' => ['required', 'boolean'],
            'is_imd' => ['required', 'boolean'],
        ]);

        // Logika Cerdas untuk menyimpan data
        if ($validatedData['is_ibu_terdaftar']) {
            // Skenario 1: Ibu sudah terdaftar
            $ibu = Ibu::find($validatedData['ibu_id']);
            $validatedData['posyandu_id'] = $ibu->posyandu_id;
            $validatedData['nomor_kk'] = $ibu->nomor_kk;
            // Isi alamat otomatis dari data Ibu
            $validatedData['alamat_lengkap_manual'] = $ibu->alamat_lengkap;
            $validatedData['rt_manual'] = $ibu->rt;
            $validatedData['rw_manual'] = $ibu->rw;
        }
        // Jika tidak, data manual dari form akan langsung digunakan

        $anak = Anak::create($validatedData);
        return response()->json($anak->load('ibu', 'posyandu'), 201);
    }

    // (Fungsi update dan destroy bisa kita upgrade nanti dengan logika serupa)
}