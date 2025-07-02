<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validasi input dari frontend
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Coba lakukan proses login
        if (Auth::attempt($credentials)) {
            // Jika berhasil, ambil data user
            $user = Auth::user();
            // Buat token menggunakan Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            // 3. Kirim kembali response sukses beserta token
            return response()->json([
                'message' => 'Login berhasil',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
            ]);
        }

        // 4. Jika gagal, kirim response error
        return response()->json(['message' => 'Email atau password salah'], 401);
    }
}