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
    public function index()
    {
        return Ibu::with(['user', 'posyandu'])->latest()->get();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            // Data Diri & Akun
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
            
            // Data Suami
            'nama_suami' => ['required', 'string', 'max:255'],
            'nik_suami' => ['nullable', 'string', 'size:16'],
            'nomor_hp_suami' => ['required', 'string', 'max:25'],

            // Data Kehamilan
            'kehamilan_ke' => ['required', 'integer', 'min:1'],
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
            
            // 3. Buat data Ibu dengan data yang relevan saja
            // PERBAIKAN: Kita kecualikan field yang tidak ada di tabel 'ibus'
            $ibuData = $request->except(['email', 'password', 'password_confirmation', 'village_id']);
            
            $ibu = new Ibu($ibuData);
            $ibu->hpl = $hpl;
            $ibu->user_id = $user->id; // Hubungkan dengan user yang baru dibuat
            $ibu->save();
            
            DB::commit();
            return response()->json($ibu->load('user', 'posyandu'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat data ibu.', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, Ibu $ibu)
    {
        $validatedData = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($ibu->user_id)],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'is_nik_exists' => ['required', 'boolean'],
            'nik' => ['exclude_if:is_nik_exists,false', 'required', 'string', 'size:16', Rule::unique('ibus')->ignore($ibu->id), Rule::unique('kaders', 'nik'), Rule::unique('anaks', 'nik')],
            'nomor_kk' => ['exclude_if:is_nik_exists,false', 'required', 'string', 'max:20', Rule::unique('ibus', 'nomor_kk')->ignore($ibu->id)],
            // ...tambahkan semua validasi lain di sini...
        ]);

        try {
            DB::beginTransaction();
            if ($ibu->user) {
                $ibu->user->update(['name' => $validatedData['nama_lengkap'], 'email' => $validatedData['email']]);
                if ($request->filled('password')) {
                    $ibu->user->update(['password' => Hash::make($request->password)]);
                }
            }
            
            // PERBAIKAN: Kita kecualikan field yang tidak ada di tabel 'ibus'
            $ibu->update($request->except(['email', 'password', 'password_confirmation', 'village_id']));

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
