<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anak;
use App\Models\Ibu;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class AnakController extends Controller
{
    /**
     * Menampilkan semua data anak.
     */
    public function index()
    {
        // Mengambil data anak, sertakan relasi ibu dan posyandunya untuk ditampilkan di tabel
        return Anak::with(['ibu.user', 'posyandu'])->latest()->get();
    }

    /**
     * Menyimpan data anak baru.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            // "Saklar" untuk menentukan mode input
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

        try {
            DB::beginTransaction();

            $dataToCreate = $validatedData;

            // Logika Cerdas: Isi data otomatis jika Ibu sudah terdaftar
            if ($validatedData['is_ibu_terdaftar']) {
                $ibu = Ibu::find($validatedData['ibu_id']);
                $dataToCreate['posyandu_id'] = $ibu->posyandu_id;
                // Jika NIK & KK anak tidak diisi, ambil dari data Ibu
                if (!$request->filled('nik')) {
                    $dataToCreate['nik'] = null;
                }
                if (!$request->filled('nomor_kk')) {
                    $dataToCreate['nomor_kk'] = $ibu->nomor_kk;
                }
            }
            
            $anak = Anak::create($dataToCreate);
            
            DB::commit();
            return response()->json($anak->load('ibu', 'posyandu'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat data anak.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Menampilkan satu data anak spesifik.
     */
    public function show(Anak $anak)
    {
        // Sertakan semua relasi yang mungkin dibutuhkan di halaman detail
        return $anak->load(['ibu.user', 'posyandu.village.district.regency.province']);
    }

    /**
     * Memperbarui data anak.
     */
    public function update(Request $request, Anak $anak)
    {
        // Validasi untuk update
        $validatedData = $request->validate([
            'ibu_id' => ['required', 'exists:ibus,id'],
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'is_nik_exists' => ['required', 'boolean'],
            'nik' => ['exclude_if:is_nik_exists,false', 'required', 'string', 'size:16', Rule::unique('anaks')->ignore($anak->id), Rule::unique('ibus', 'nik'), Rule::unique('kaders', 'nik')],
            'nomor_kk' => ['exclude_if:is_nik_exists,false', 'required', 'string', 'max:20'],
            'anak_ke' => ['required', 'integer', 'min:1'],
            'tanggal_lahir' => ['required', 'date'],
            'jenis_kelamin' => ['required', 'in:LAKI-LAKI,PEREMPUAN'],
            'bb_lahir' => ['required', 'numeric'],
            'pb_lahir' => ['required', 'numeric'],
            'punya_buku_kia' => ['required', 'boolean'],
            'is_imd' => ['required', 'boolean'],
        ]);
        
        $ibu = Ibu::find($validatedData['ibu_id']);
        $validatedData['posyandu_id'] = $ibu->posyandu_id;

        $anak->update($validatedData);
        return response()->json($anak->load('ibu', 'posyandu'));
    }

    /**
     * Menghapus data anak.
     */
    public function destroy(Anak $anak)
    {
        $anak->delete();
        return response()->json(['message' => 'Data Anak berhasil dihapus.']);
    }
}
