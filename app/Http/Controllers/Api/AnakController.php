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

class AnakController extends Controller
{
    /**
     * Menampilkan semua data anak dengan pagination.
     */
    public function index(Request $request)
    {
        return Anak::with(['ibu.user', 'posyandu'])->latest()->paginate(15);
    }

    /**
     * Menampilkan satu data anak spesifik.
     */
    public function show(Anak $anak)
    {
        return $anak->load(['ibu.user', 'posyandu']);
    }

    /**
     * Menyimpan data anak baru dengan logika cerdas.
     */
    public function store(Request $request)
    {
        // Validasi untuk semua field dari form lengkap
        $validatedData = $request->validate([
            'is_ibu_terdaftar' => ['required', 'boolean'],
            
            // Validasi jika Ibu SUDAH terdaftar
            'ibu_id' => ['exclude_if:is_ibu_terdaftar,false', 'required', 'exists:ibus,id'],
            
            // Validasi jika Ibu BELUM terdaftar (diinput manual)
            'nama_ibu_manual' => ['exclude_if:is_ibu_terdaftar,true', 'required', 'string', 'max:255'],
            'nik_ibu_manual' => ['exclude_if:is_ibu_terdaftar,true', 'nullable', 'string', 'size:16'],
            'nomor_hp_ibu_manual' => ['exclude_if:is_ibu_terdaftar,true', 'required', 'string', 'max:25'],
            'email' => ['exclude_if:is_ibu_terdaftar,true', 'required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['exclude_if:is_ibu_terdaftar,true', 'required', 'confirmed', Rules\Password::defaults()],
            'alamat_lengkap' => ['required', 'string'],
            'rt' => ['required', 'string', 'max:3'],
            'rw' => ['required', 'string', 'max:3'],
            'village_id' => ['required', 'string', 'max:10'],
            
            // Validasi data anak (selalu wajib)
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'is_nik_exists' => ['required', 'boolean'],
            'nik' => ['exclude_if:is_nik_exists,false', 'nullable', 'string', 'size:16', Rule::unique('anaks', 'nik'), Rule::unique('ibus', 'nik'), Rule::unique('kaders', 'nik')],
            'nomor_kk' => ['required', 'string', 'max:20'],
            'anak_ke' => ['required', 'integer', 'min:1'],
            'tanggal_lahir' => ['required', 'date'],
            'jenis_kelamin' => ['required', 'in:LAKI-LAKI,PEREMPUAN'],
            'bb_lahir' => ['required', 'numeric'],
            'pb_lahir' => ['required', 'numeric'],
            'punya_buku_kia' => ['required', 'boolean'],
            'is_imd' => ['required', 'boolean'],
            'posyandu_id' => ['required', 'exists:posyandus,id'],
        ]);

        try {
            DB::beginTransaction();

            $ibu = null;

            if ($validatedData['is_ibu_terdaftar']) {
                // --- SKENARIO 1: IBU SUDAH TERDAFTAR ---
                $ibu = Ibu::find($validatedData['ibu_id']);
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
                    'alamat_lengkap' => $validatedData['alamat_lengkap'],
                    'rt' => $validatedData['rt'],
                    'rw' => $validatedData['rw'],
                    'nomor_hp_suami' => $validatedData['nomor_hp_ibu_manual'], // Asumsi no hp ibu = no hp kontak keluarga
                    // Asumsi data lain diisi default atau nullable dari migrasi
                ]);
            }
            
            // Siapkan data anak untuk disimpan
            $anakData = [
                'ibu_id' => $ibu->id,
                'posyandu_id' => $ibu->posyandu_id,
                'nama_lengkap' => $validatedData['nama_lengkap'],
                'is_nik_exists' => $validatedData['is_nik_exists'],
                'nik' => $validatedData['nik'] ?? null,
                'nomor_kk' => $ibu->nomor_kk,
                'anak_ke' => $validatedData['anak_ke'],
                'tanggal_lahir' => $validatedData['tanggal_lahir'],
                'jenis_kelamin' => $validatedData['jenis_kelamin'],
                'bb_lahir' => $validatedData['bb_lahir'],
                'pb_lahir' => $validatedData['pb_lahir'],
                'punya_buku_kia' => $validatedData['punya_buku_kia'],
                'is_imd' => $validatedData['is_imd'],
                'village_id' => $ibu->posyandu->village_id,
                'alamat_lengkap' => $ibu->alamat_lengkap,
                'rt' => $ibu->rt,
                'rw' => $ibu->rw,
            ];

            Anak::create($anakData);
            
            DB::commit();
            return response()->json(['message' => 'Data anak berhasil disimpan.'], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat data anak.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Memperbarui data anak.
     */
    public function update(Request $request, Anak $anak)
    {
        // (Logika update bisa kita sempurnakan nanti dengan cara yang sama)
        $validatedData = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            // ... tambahkan validasi lain untuk update
        ]);

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
