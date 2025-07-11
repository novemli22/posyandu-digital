<?php

use App\Http\Controllers\Api\AnakController;
use App\Http\Controllers\Api\IbuController;
use App\Http\Controllers\Api\KaderController;
use App\Http\Controllers\Api\PosyanduController;
use App\Http\Controllers\Api\WilayahController;
use App\Http\Controllers\AuthController;
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
    
    Route::get('/user', fn (Request $request) => $request->user());

    // Rute untuk Wilayah (Cascading Dropdown)
    Route::get('/wilayah/provinces', [WilayahController::class, 'provinces']);
    Route::get('/wilayah/regencies', [WilayahController::class, 'regencies']);
    Route::get('/wilayah/districts', [WilayahController::class, 'districts']);
    Route::get('/wilayah/villages', [WilayahController::class, 'villages']);

    // Rute CRUD lengkap menggunakan apiResource
    Route::apiResource('/posyandus', PosyanduController::class);
    Route::get('/posyandus/{posyandu}/pendamping', [PosyanduController::class, 'getPendamping']);
    Route::apiResource('/kaders', KaderController::class);
    Route::apiResource('/ibus', IbuController::class);
    Route::apiResource('/anaks', AnakController::class);
});