<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anak;
use App\Models\Ibu;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Carbon\Carbon;

class AnakController extends Controller
{
    /**
     * Menampilkan semua data anak dengan pagination.
     */
    public function index()
    {
        return Anak::with(['ibu.user', 'posyandu'])->latest()->paginate(15);
    }

    /**
     * Menyimpan data anak baru dengan logika cerdas.
     */
    public function store(Request $request)
    {
        // Validasi data umum anak
        $validatedData = $request->validate([
            'is_ibu_terdaftar' => ['required', 'boolean'],
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'is_nik_exists' => ['required', 'boolean'],
            'nik' => ['exclude_if:is_nik_exists,false', 'required', 'string', 'size:16', Rule::unique('anaks', 'nik'), Rule::unique('ibus', 'nik'), Rule::unique('kaders', 'nik')],
            'anak_ke' => ['required', 'integer', 'min:1'],
            'tanggal_lahir' => ['required', 'date'],
            'jenis_kelamin' => ['required', 'in:LAKI-LAKI,PEREMPUAN'],
            'bb_lahir' => ['required', 'numeric'],
            'pb_lahir' => ['required', 'numeric'],
            'punya_buku_kia' => ['required', 'boolean'],
            'is_imd' => ['required', 'boolean'],
            'nomor_kk' => ['exclude_if:is_nik_exists,false', 'nullable', 'string', 'max:20'],

            // Validasi jika Ibu SUDAH terdaftar
            'ibu_id' => ['exclude_if:is_ibu_terdaftar,false', 'required', 'exists:ibus,id'],
            
            // Validasi jika Ibu BELUM terdaftar (diinput manual)
            'nama_ibu_manual' => ['exclude_if:is_ibu_terdaftar,true', 'required', 'string', 'max:255'],
            'nik_ibu_manual' => ['exclude_if:is_ibu_terdaftar,true', 'nullable', 'string', 'size:16'],
            'email' => ['exclude_if:is_ibu_terdaftar,true', 'required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['exclude_if:is_ibu_terdaftar,true', 'required', 'confirmed', Rules\Password::defaults()],
            'posyandu_id' => ['exclude_if:is_ibu_terdaftar,true', 'required', 'exists:posyandus,id'],
            'alamat_lengkap_manual' => ['exclude_if:is_ibu_terdaftar,true', 'nullable', 'string'],
            'rt_manual' => ['exclude_if:is_ibu_terdaftar,true', 'nullable', 'string', 'max:3'],
            'rw_manual' => ['exclude_if:is_ibu_terdaftar,true', 'nullable', 'string', 'max:3'],
        ]);

        try {
            DB::beginTransaction();

            $dataAnak = $validatedData;
            $ibu = null;

            if ($validatedData['is_ibu_terdaftar']) {
                // --- SKENARIO 1: IBU SUDAH TERDAFTAR ---
                $ibu = Ibu::find($validatedData['ibu_id']);
                $dataAnak['posyandu_id'] = $ibu->posyandu_id;
                $dataAnak['nomor_kk'] = $ibu->nomor_kk;
                
            } else {
                // --- SKENARIO 2: IBU BARU (INPUT MANUAL) ---
                $user = User::create([
                    'name' => $validatedData['nama_ibu_manual'],
                    'email' => $validatedData['email'],
                    'password' => Hash::make($validatedData['password']),
                    'role' => 'IBU',
                ]);

                $ibu = Ibu::create([
                    'user_id' => $user->id,
                    'posyandu_id' => $validatedData['posyandu_id'],
                    'nama_lengkap' => $validatedData['nama_ibu_manual'],
                    'nik' => $validatedData['nik_ibu_manual'],
                    'nomor_kk' => $validatedData['nomor_kk'],
                    'alamat_lengkap' => $validatedData['alamat_lengkap_manual'],
                    'rt' => $validatedData['rt_manual'],
                    'rw' => $validatedData['rw_manual'],
                    // Asumsi data lain diisi default atau nullable
                ]);

                $dataAnak['ibu_id'] = $ibu->id;
            }
            
            $anak = Anak::create($dataAnak);
            
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
        return $anak->load(['ibu.user', 'posyandu']);
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
