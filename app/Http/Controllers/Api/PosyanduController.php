<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Posyandu;
use Illuminate\Http\Request;

class PosyanduController extends Controller
{
    public function index()
    {
        return Posyandu::with('village.district.regency.province')->latest()->get();
    }

    public function show(Posyandu $posyandu)
    {
        return $posyandu->load('village.district.regency.province');
    }

    public function store(Request $request)
    {
        // Tambahkan 'puskesmas_pembina' ke dalam validasi
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'puskesmas_pembina' => ['required', 'string', 'max:255'],
            'village_id' => ['required', 'exists:villages,id'],
            'address' => ['required', 'string'],
            'rt' => ['required', 'string', 'max:3'],
            'rw' => ['required', 'string', 'max:3'],
        ]);
        $posyandu = Posyandu::create($validated);
        return response()->json($posyandu->load('village.district.regency.province'), 201);
    }

    public function update(Request $request, Posyandu $posyandu)
    {
        // Tambahkan 'puskesmas_pembina' ke dalam validasi
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'puskesmas_pembina' => ['required', 'string', 'max:255'],
            'village_id' => ['required', 'exists:villages,id'],
            'address' => ['required', 'string'],
            'rt' => ['required', 'string', 'max:3'],
            'rw' => ['required', 'string', 'max:3'],
        ]);
        $posyandu->update($validated);
        return response()->json($posyandu->load('village.district.regency.province'));
    }

    public function destroy(Posyandu $posyandu)
    {
        $posyandu->delete();
        return response()->json(['message' => 'Data Posyandu berhasil dihapus.']);
    }
}
