<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ibu;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Carbon\Carbon;

class IbuController extends Controller
{
    /**
     * Menampilkan daftar semua data Ibu.
     */
    public function index()
    {
        return Ibu::with(['user', 'posyandu'])->latest()->get();
    }

    /**
     * Menampilkan satu data Ibu spesifik untuk halaman detail.
     */
    public function show(Ibu $ibu)
    {
        return $ibu->load(['user', 'posyandu.village.district.regency.province']);
    }

    /**
     * Menyimpan data Ibu baru.
     */
    public function store(Request $request)
    {
        // Validasi untuk semua field dari form lengkap
        $validatedData = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'is_nik_exists' => ['required', 'boolean'],
            'nik' => ['exclude_if:is_nik_exists,false', 'required', 'string', 'size:16', Rule::unique('ibus', 'nik'), Rule::unique('kaders', 'nik'), Rule::unique('anaks', 'nik')],
            'nomor_kk' => ['exclude_if:is_nik_exists,false', 'required', 'string', 'max:20', Rule::unique('ibus', 'nomor_kk')],
            'tanggal_lahir' => ['required', 'date'],
            'golongan_darah' => ['required', 'string', 'max:10'],
            'pendidikan' => ['nullable', 'string'],
            'pekerjaan' => ['nullable', 'string'],
            'nama_suami' => ['required', 'string', 'max:255'],
            'nik_suami' => ['nullable', 'string', 'size:16'],
            'nomor_hp_suami' => ['required', 'string', 'max:25'],
            'kehamilan_ke' => ['required', 'integer', 'min:1'],
            'hpht' => ['required', 'date'],
            'bb_awal' => ['required', 'numeric'],
            'tb_awal' => ['required', 'numeric'],
            'jarak_kehamilan_bulan' => ['nullable', 'integer'],
            'riwayat_penyakit' => ['nullable', 'string'],
            'riwayat_alergi' => ['nullable', 'string'],
            'kontrasepsi_sebelumnya' => ['nullable', 'string'],
            'kontrasepsi_lainnya' => ['nullable', 'string'],
            'is_ktd' => ['required', 'boolean'],
            'posyandu_id' => ['required', 'exists:posyandus,id'],
            'punya_buku_kia' => ['required', 'boolean'],
            'jaminan_kesehatan' => ['required', 'string'],
            'nomor_jaminan_kesehatan' => ['nullable', 'string'],
            'faskes_tk1' => ['nullable', 'string'],
            'faskes_rujukan' => ['nullable', 'string'],
            'no_registrasi_kohort' => ['nullable', 'string', 'unique:ibus,no_registrasi_kohort'],
            'alamat_lengkap' => ['required', 'string'],
            'rt' => ['required', 'string', 'max:3'],
            'rw' => ['required', 'string', 'max:3'],
        ]);

        try {
            DB::beginTransaction();
            // 1. Buat data untuk tabel 'users'
            $user = User::create([
                'name' => $validatedData['nama_lengkap'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'role' => 'IBU',
            ]);

            // 2. Hitung HPL
            $hpl = Carbon::parse($validatedData['hpht'])->addDays(7)->subMonths(3)->addYear();
            
            // 3. Buat data Ibu secara eksplisit
            $ibu = Ibu::create([
                'user_id' => $user->id,
                'posyandu_id' => $validatedData['posyandu_id'],
                'nama_lengkap' => $validatedData['nama_lengkap'],
                'nik' => $validatedData['nik'] ?? null,
                'nomor_kk' => $validatedData['nomor_kk'] ?? null,
                'is_nik_exists' => $validatedData['is_nik_exists'],
                'tanggal_lahir' => $validatedData['tanggal_lahir'],
                'golongan_darah' => $validatedData['golongan_darah'],
                'pendidikan' => $validatedData['pendidikan'],
                'pekerjaan' => $validatedData['pekerjaan'],
                'alamat_lengkap' => $validatedData['alamat_lengkap'],
                'rt' => $validatedData['rt'],
                'rw' => $validatedData['rw'],
                'nama_suami' => $validatedData['nama_suami'],
                'nik_suami' => $validatedData['nik_suami'],
                'nomor_hp_suami' => $validatedData['nomor_hp_suami'],
                'kehamilan_ke' => $validatedData['kehamilan_ke'],
                'jarak_kehamilan_bulan' => $validatedData['jarak_kehamilan_bulan'],
                'hpht' => $validatedData['hpht'],
                'hpl' => $hpl,
                'bb_awal' => $validatedData['bb_awal'],
                'tb_awal' => $validatedData['tb_awal'],
                'riwayat_penyakit' => $validatedData['riwayat_penyakit'],
                'riwayat_alergi' => $validatedData['riwayat_alergi'],
                'kontrasepsi_sebelumnya' => $validatedData['kontrasepsi_sebelumnya'] === 'Lainnya' ? $validatedData['kontrasepsi_lainnya'] : $validatedData['kontrasepsi_sebelumnya'],
                'kontrasepsi_lainnya' => $validatedData['kontrasepsi_lainnya'],
                'punya_buku_kia' => $validatedData['punya_buku_kia'],
                'jaminan_kesehatan' => $validatedData['jaminan_kesehatan'],
                'nomor_jaminan_kesehatan' => $validatedData['nomor_jaminan_kesehatan'],
                'is_ktd' => $validatedData['is_ktd'],
                'faskes_tk1' => $validatedData['faskes_tk1'],
                'faskes_rujukan' => $validatedData['faskes_rujukan'],
                'no_registrasi_kohort' => $validatedData['no_registrasi_kohort'],
            ]);
            
            DB::commit();
            return response()->json($ibu->load('user', 'posyandu'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat data ibu.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Memperbarui data Ibu.
     */
    public function update(Request $request, Ibu $ibu)
    {
        // Validasi lengkap juga untuk update
        $validatedData = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($ibu->user_id)],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'is_nik_exists' => ['required', 'boolean'],
            'nik' => ['exclude_if:is_nik_exists,false', 'required', 'string', 'size:16', Rule::unique('ibus')->ignore($ibu->id), Rule::unique('kaders', 'nik'), Rule::unique('anaks', 'nik')],
            'nomor_kk' => ['exclude_if:is_nik_exists,false', 'required', 'string', 'max:20', Rule::unique('ibus', 'nomor_kk')->ignore($ibu->id)],
            'tanggal_lahir' => ['required', 'date'],
            'golongan_darah' => ['required', 'string', 'max:10'],
            'pendidikan' => ['nullable', 'string'],
            'pekerjaan' => ['nullable', 'string'],
            'nama_suami' => ['required', 'string', 'max:255'],
            'nik_suami' => ['nullable', 'string', 'size:16'],
            'nomor_hp_suami' => ['required', 'string', 'max:25'],
            'kehamilan_ke' => ['required', 'integer', 'min:1'],
            'hpht' => ['required', 'date'],
            'bb_awal' => ['required', 'numeric'],
            'tb_awal' => ['required', 'numeric'],
            'jarak_kehamilan_bulan' => ['nullable', 'integer'],
            'riwayat_penyakit' => ['nullable', 'string'],
            'riwayat_alergi' => ['nullable', 'string'],
            'kontrasepsi_sebelumnya' => ['nullable', 'string'],
            'kontrasepsi_lainnya' => ['nullable', 'string'],
            'is_ktd' => ['required', 'boolean'],
            'posyandu_id' => ['required', 'exists:posyandus,id'],
            'punya_buku_kia' => ['required', 'boolean'],
            'jaminan_kesehatan' => ['required', 'string'],
            'nomor_jaminan_kesehatan' => ['nullable', 'string'],
            'faskes_tk1' => ['nullable', 'string'],
            'faskes_rujukan' => ['nullable', 'string'],
            'no_registrasi_kohort' => ['nullable', 'string', Rule::unique('ibus')->ignore($ibu->id)],
            'alamat_lengkap' => ['required', 'string'],
            'rt' => ['required', 'string', 'max:3'],
            'rw' => ['required', 'string', 'max:3'],
        ]);

        try {
            DB::beginTransaction();
            if ($ibu->user) {
                $ibu->user->update(['name' => $validatedData['nama_lengkap'], 'email' => $validatedData['email']]);
                if ($request->filled('password')) {
                    $ibu->user->update(['password' => Hash::make($request->password)]);
                }
            }
            
            $ibu->update($validatedData);

            if ($request->has('hpht')) {
                $ibu->hpl = Carbon::parse($request->hpht)->addDays(7)->subMonths(3)->addYear();
                $ibu->save();
            }

            DB::commit();
            return response()->json($ibu->load('user', 'posyandu'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal mengupdate data ibu.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Menghapus data Ibu.
     */
    public function destroy(Ibu $ibu)
    {
        try {
            DB::beginTransaction();
            if ($ibu->user) { $ibu->user->delete(); }
            $ibu->anaks()->delete();
            $ibu->delete();
            DB::commit();
            return response()->json(['message' => 'Data Ibu dan semua data anaknya berhasil dihapus.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menghapus data ibu.', 'error' => $e->getMessage()], 500);
        }
    }
}
