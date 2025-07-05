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
use Carbon\Carbon; // <-- Import Carbon untuk manipulasi tanggal

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
     * Menyimpan data Ibu baru.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            // Data Diri & Akun
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'is_nik_exists' => ['required', 'boolean'],
            'nik' => ['exclude_if:is_nik_exists,false', 'required', 'string', 'size:16', 'unique:ibus,nik'],
            'nomor_kk' => ['required', 'string', 'max:20'],
            'tanggal_lahir' => ['required', 'date'],
            'golongan_darah' => ['required', 'string', 'max:3'],
            'pendidikan' => ['nullable', 'string'],
            'pekerjaan' => ['nullable', 'string'],
            
            // Data Suami
            'nama_suami' => ['required', 'string', 'max:255'],
            'nik_suami' => ['nullable', 'string', 'size:16'],
            'nomor_hp_suami' => ['nullable', 'string', 'max:25'],

            // Data Kehamilan
            'kehamilan_ke' => ['required', 'integer'],
            'hpht' => ['required', 'date'],
            'bb_awal' => ['required', 'numeric'],
            'tb_awal' => ['required', 'numeric'],
            'jarak_kehamilan_bulan' => ['nullable', 'integer'],
            'riwayat_penyakit' => ['nullable', 'string'],
            'riwayat_alergi' => ['nullable', 'string'],
            'kontrasepsi_sebelumnya' => ['nullable', 'string'],
            'is_ktd' => ['required', 'boolean'],
            
            // Data Administrasi & Faskes
            'posyandu_id' => ['required', 'exists:posyandus,id'],
            'punya_buku_kia' => ['required', 'boolean'],
            'jaminan_kesehatan' => ['required', 'string'],
            'nomor_jaminan_kesehatan' => ['nullable', 'string'],
            'faskes_tk1' => ['nullable', 'string'],
            'faskes_rujukan' => ['nullable', 'string'],
        ]);

        try {
            DB::beginTransaction();
            // Buat akun user untuk Ibu
            $user = User::create([
                'name' => $validatedData['nama_lengkap'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'role' => 'IBU',
            ]);

            // Hitung HPL dengan Rumus Naegele
            $hpl = Carbon::parse($validatedData['hpht'])->addDays(7)->subMonths(3)->addYear();
            
            $ibu = new Ibu($validatedData);
            $ibu->hpl = $hpl; // Masukkan hasil perhitungan HPL
            $ibu->user()->associate($user); // Hubungkan dengan akun user
            $ibu->save();
            
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
        // Validasi untuk update (mirip dengan store, tapi sesuaikan)
        $validatedData = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($ibu->user_id)],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'nik' => ['nullable', 'string', 'size:16', Rule::unique('ibus')->ignore($ibu->id)],
            // ... tambahkan validasi lain ...
        ]);

        try {
            DB::beginTransaction();

            // Update data user jika ada
            if ($ibu->user) {
                $ibu->user->update([
                    'name' => $validatedData['nama_lengkap'],
                    'email' => $validatedData['email'],
                ]);
                if ($request->filled('password')) {
                    $ibu->user->update(['password' => Hash::make($request->password)]);
                }
            }
            
            // Update data ibu
            $ibu->update($validatedData);

            // Hitung ulang HPL jika HPHT diubah
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
        // Fungsi destroy tetap sama
        try {
            DB::beginTransaction();
            $user = $ibu->user;
            $ibu->anaks()->delete();
            $ibu->delete();
            if ($user) {
                $user->delete();
            }
            DB::commit();
            return response()->json(['message' => 'Data Ibu dan semua data anaknya berhasil dihapus.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menghapus data ibu.', 'error' => $e->getMessage()], 500);
        }
    }
}