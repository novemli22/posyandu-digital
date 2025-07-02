<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\KaderController;
use App\Http\Controllers\Api\PosyanduController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rute publik, hanya untuk login
Route::post('/login', [AuthController::class, 'login']);

// --- SEMUA RUTE LAIN YANG BUTUH LOGIN HARUS ADA DI DALAM GRUP INI ---
Route::middleware('auth:sanctum')->group(function () {
    
    // Rute untuk mendapatkan data user yang sedang login
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Rute untuk data Kader
    Route::get('/kaders', [KaderController::class, 'index']);
    Route::post('/kaders', [KaderController::class, 'store']);
    Route::delete('/kaders/{kader}', [KaderController::class, 'destroy']);
    
    // Rute untuk data Posyandu
    Route::get('/posyandu', [PosyanduController::class, 'index']);
    
    // Nanti rute untuk Ibu, Anak, Pemeriksaan, dll. juga akan kita taruh di sini
});