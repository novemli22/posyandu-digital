<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class IbuFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $hpht = fake()->dateTimeBetween('-3 months', '-1 month');

        return [
            'nama_lengkap' => fake()->name('female'),
            'nik' => fake()->unique()->numerify('################'),
            'nomor_kk' => fake()->unique()->numerify('################'),
            'tanggal_lahir' => fake()->dateTimeBetween('-40 years', '-18 years'),
            'golongan_darah' => fake()->randomElement(['A', 'B', 'AB', 'O']),
            'pendidikan' => fake()->randomElement(['SD', 'SMP', 'SMA', 'DIPLOMA', 'S1']),
            'pekerjaan' => fake()->jobTitle(),
            'nama_suami' => fake()->name('male'),
            'nomor_hp_suami' => fake()->phoneNumber(),
            'alamat_lengkap' => fake()->address(),
            'rt' => fake()->numerify('00#'),
            'rw' => fake()->numerify('00#'),
            'kehamilan_ke' => fake()->numberBetween(1, 5),
            'hpht' => $hpht,
            'hpl' => (clone $hpht)->modify('+280 days'),
            'bb_awal' => fake()->randomFloat(1, 45, 70),
            'tb_awal' => fake()->randomFloat(1, 145, 170),
            'punya_buku_kia' => fake()->boolean(),
            'jaminan_kesehatan' => fake()->randomElement(['BPJS', 'KIS', 'UMUM']),
        ];
    }
}