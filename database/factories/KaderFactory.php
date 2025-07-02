<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Kader>
 */
class KaderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // user_id & posyandu_id akan kita set nanti di Seeder
            
            'nama_lengkap'    => fake()->name(),
            'nik'             => fake()->unique()->numerify('################'),
            'nomor_hp'        => fake()->unique()->phoneNumber(),
            'tempat_lahir'    => fake()->city(),
            'tanggal_lahir'   => fake()->date(),
            'jenis_kelamin'   => fake()->randomElement(['LAKI-LAKI', 'PEREMPUAN']),
            'alamat'          => fake()->address(),
            'status'          => 'AKTIF',
        ];
    }
}