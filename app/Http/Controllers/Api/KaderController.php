<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kader;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class KaderController extends Controller
{
    /**
     * Menampilkan daftar semua kader (Versi Cepat dengan Pagination).
     */
    public function index(Request $request)
    {
        return Kader::with(['user', 'posyandu'])->latest()->paginate(15);
    }

    /**
     * Menampilkan satu data kader spesifik (Versi Lengkap).
     */
    public function show(Kader $kader)
    {
        return $kader->load([
            'user', 
            'posyandu', 
            'ktpVillage.district.regency.province', 
            'domisiliVillage.district.regency.province'
        ]);
    }

    /**
     * Menyimpan data kader baru.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'posyandu_id' => ['required', 'exists:posyandus,id'],
            'nik' => ['required', 'string', 'size:16', Rule::unique('kaders', 'nik'), Rule::unique('ibus', 'nik'), Rule::unique('anaks', 'nik')],
            'tanggal_lahir' => ['required', 'date'],
            'jenis_kelamin' => ['required', 'string'],
            'nomor_hp' => ['required', 'string', 'max:25', Rule::unique('kaders', 'nomor_hp')],
            'memiliki_jkn' => ['required', 'boolean'],
            'ktp_village_id' => ['required', 'string', 'max:10'],
            'ktp_address' => ['required', 'string'],
            'ktp_rt' => ['required', 'string', 'max:3'],
            'ktp_rw' => ['required', 'string', 'max:3'],
            'domisili_sesuai_ktp' => ['required', 'boolean'],
            'domisili_village_id' => ['exclude_if:domisili_sesuai_ktp,true', 'required', 'string', 'max:10'],
            'domisili_address' => ['exclude_if:domisili_sesuai_ktp,true', 'required', 'string'],
            'domisili_rt' => ['exclude_if:domisili_sesuai_ktp,true', 'required', 'string', 'max:3'],
            'domisili_rw' => ['exclude_if:domisili_sesuai_ktp,true', 'required', 'string', 'max:3'],
            'pelatihan_posyandu' => ['required', 'boolean'],
            'pelatihan_ibu_hamil' => ['required', 'boolean'],
            'pelatihan_balita' => ['required', 'boolean'],
            'tkk_posyandu' => ['required', 'integer', 'min:0'],
            'tkk_ibu_hamil' => ['required', 'integer', 'min:0'],
            'tkk_balita' => ['required', 'integer', 'min:0'],
        ]);

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $validatedData['nama_lengkap'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'role' => 'KADER',
            ]);

            $kaderData = collect($validatedData)->except(['email', 'password', 'password_confirmation'])->all();
            
            $kader = new Kader($kaderData);
            $kader->user_id = $user->id;
            $kader->save();
            
            DB::commit();
            return response()->json($kader->load('user', 'posyandu'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat data kader.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Memperbarui data kader.
     */
    public function update(Request $request, Kader $kader)
    {
         $validatedData = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($kader->user_id)],
            'posyandu_id' => ['required', 'exists:posyandus,id'],
            'nik' => ['required', 'string', 'size:16', Rule::unique('kaders')->ignore($kader->id), Rule::unique('ibus', 'nik'), Rule::unique('anaks', 'nik')],
            'nomor_hp' => ['required', 'string', 'max:25', Rule::unique('kaders', 'nomor_hp')->ignore($kader->id)],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'tanggal_lahir' => ['required', 'date'],
            'jenis_kelamin' => ['required', 'string'],
            'memiliki_jkn' => ['required', 'boolean'],
            'ktp_village_id' => ['required', 'string', 'max:10'],
            'ktp_address' => ['required', 'string'],
            'ktp_rt' => ['required', 'string', 'max:3'],
            'ktp_rw' => ['required', 'string', 'max:3'],
            'domisili_sesuai_ktp' => ['required', 'boolean'],
            'domisili_village_id' => ['exclude_if:domisili_sesuai_ktp,true', 'required', 'string', 'max:10'],
            'domisili_address' => ['exclude_if:domisili_sesuai_ktp,true', 'required', 'string'],
            'domisili_rt' => ['exclude_if:domisili_sesuai_ktp,true', 'required', 'string', 'max:3'],
            'domisili_rw' => ['exclude_if:domisili_sesuai_ktp,true', 'required', 'string', 'max:3'],
            'pelatihan_posyandu' => ['required', 'boolean'],
            'pelatihan_ibu_hamil' => ['required', 'boolean'],
            'pelatihan_balita' => ['required', 'boolean'],
            'tkk_posyandu' => ['required', 'integer', 'min:0'],
            'tkk_ibu_hamil' => ['required', 'integer', 'min:0'],
            'tkk_balita' => ['required', 'integer', 'min:0'],
        ]);

        try {
            DB::beginTransaction();
            if ($kader->user) {
                $kader->user->update([
                    'name' => $validatedData['nama_lengkap'],
                    'email' => $validatedData['email'],
                ]);
                if ($request->filled('password')) {
                    $kader->user->update(['password' => Hash::make($request->password)]);
                }
            }
            
            // PERBAIKAN FINAL: Gunakan data yang sudah divalidasi dan pisahkan
            $kaderData = collect($validatedData)->except(['email', 'password', 'password_confirmation'])->all();
            $kader->update($kaderData);
            
            DB::commit();
            return response()->json($kader->load('user', 'posyandu'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal mengupdate data kader.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Menghapus data kader.
     */
    public function destroy(Kader $kader)
    {
        try {
            DB::beginTransaction();
            if ($kader->user) {
                $kader->user->delete();
            }
            $kader->delete();
            DB::commit();
            return response()->json(['message' => 'Data Kader berhasil dihapus.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menghapus data kader.', 'error' => $e->getMessage()], 500);
        }
    }
}
