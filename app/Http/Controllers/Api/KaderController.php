<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kader;
use Illuminate\Http\Request;
use App\Models\User; // <-- Tambahkan ini
use Illuminate\Support\Facades\DB; // <-- Tambahkan ini
use Illuminate\Support\Facades\Hash; // <-- Tambahkan ini
use Illuminate\Validation\Rules; // <-- Tambahkan ini

class KaderController extends Controller
{
    /**
     * Menampilkan semua data kader.
     */
    public function index()
    {
        // Ambil semua data kader, dan sertakan juga data relasi 'user' dan 'posyandu'
        $kaders = Kader::with(['user', 'posyandu'])->get();

        return response()->json($kaders);
    }

    public function store(Request $request)
    {
        // Validasi data yang masuk dari form React
        $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'posyandu_id' => ['required', 'exists:posyandus,id'],
            // tambahkan validasi lain jika perlu sesuai form
        ]);

        // Gunakan Transaction untuk memastikan kedua data (user & kader) berhasil dibuat
        try {
            DB::beginTransaction();

            // 1. Buat akun user dulu untuk login
            $user = User::create([
                'name' => $request->nama_lengkap,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'KADER',
            ]);

            // 2. Buat profil kader yang terhubung ke user tersebut
            $kader = Kader::create([
                'user_id' => $user->id,
                'posyandu_id' => $request->posyandu_id,
                'nama_lengkap' => $request->nama_lengkap,
                // isi kolom lain dari request jika ada...
            ]);

            DB::commit();

            // Kirim kembali data kader yang baru dibuat beserta relasinya
            return response()->json($kader->load('user', 'posyandu'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            // Kirim pesan error jika terjadi kegagalan
            return response()->json(['message' => 'Gagal membuat kader.', 'error' => $e->getMessage()], 500);
        }
    }


    public function destroy(Kader $kader)
    {
        try {
            $user = $kader->user;
            $kader->delete();
            $user->delete();

            return response()->json(['message' => 'Kader berhasil dihapus.']);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menghapus kader.', 'error' => $e->getMessage()], 500);
        }
}
}