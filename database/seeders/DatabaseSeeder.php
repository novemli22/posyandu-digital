<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ambil SEMUA DESA di Kecamatan Nekamese (ID: 5303010)
        $villages = \App\Models\Village::where('district_id', '530116')->get();

        if ($villages->isEmpty()) {
            $this->command->error('Tidak ditemukan Desa di Kecamatan Nekamese (ID: 530116). Pastikan data wilayah sudah diimpor dengan benar.');
            return;
        }
        $this->command->info(count($villages) . ' desa ditemukan di Kecamatan Nekamese.');

        // 2. BUAT DATA POSYANDU DULU!
        // Untuk setiap desa, kita buat 3 Posyandu contoh
        $villages->each(function ($village) {
            \App\Models\Posyandu::factory(3)->create([
                'village_id' => $village->id,
            ]);
        });
        $this->command->info('Data Posyandu contoh berhasil dibuat di setiap desa.');

        // 3. Sekarang baru kita ambil lagi semua data posyandu yang sudah dibuat
        $posyandus = \App\Models\Posyandu::all();

        // 4. Buat 1 Akun Admin
        User::factory()->create([
            'name' => 'Admin Oemasi',
            'email' => 'admin@oemasi.com',
            'role' => 'ADMIN',
        ]);
        $this->command->info('Akun Admin berhasil dibuat.');

        // 5. Buat 15 Akun Kader & Data Kader
        User::factory(15)->create(['role' => 'KADER'])->each(function ($user) use ($posyandus) {
            \App\Models\Kader::factory()->create([
                'user_id' => $user->id,
                'posyandu_id' => $posyandus->random()->id,
                'nama_lengkap' => $user->name,
            ]);
        });
        $this->command->info('15 data Kader berhasil dibuat.');

        // 6. Buat 50 Akun Ibu & Data Ibu, lalu buat Anak untuk setiap Ibu
        User::factory(50)->create(['role' => 'IBU'])->each(function ($user) use ($posyandus) {
            $ibu = \App\Models\Ibu::factory()->create([
                'user_id' => $user->id,
                'posyandu_id' => $posyandus->random()->id,
                'nama_lengkap' => $user->name,
            ]);
            
            \App\Models\Anak::factory(rand(1, 2))->create([
                'ibu_id' => $ibu->id,
                'posyandu_id' => $ibu->posyandu_id,
            ]);
        });
        $this->command->info('50 data Ibu beserta Anaknya berhasil dibuat.');
    }
}