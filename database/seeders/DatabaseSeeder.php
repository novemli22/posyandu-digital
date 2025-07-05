<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // HANYA MEMBUAT SATU AKUN ADMIN
        // Semua logika untuk membuat kader, ibu, anak, dan posyandu dihapus.
        User::create([
            'name' => 'Admin Utama',
            'email' => 'admin@posyandu.com',
            'password' => Hash::make('password'),
            'role' => 'ADMIN',
        ]);

        $this->command->info('Akun Admin berhasil dibuat. Seeder selesai.');
    }
}