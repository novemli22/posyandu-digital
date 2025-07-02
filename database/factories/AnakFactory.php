<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AnakFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama_lengkap' => fake()->name(),
            'nik' => fake()->unique()->numerify('################'),
            'anak_ke' => fake()->numberBetween(1, 5),
            'tanggal_lahir' => fake()->dateTimeBetween('-6 years', 'now'),
            'jenis_kelamin' => fake()->randomElement(['LAKI-LAKI', 'PEREMPUAN']),
            'bb_lahir' => fake()->randomFloat(2, 2.5, 4.0),
            'pb_lahir' => fake()->randomFloat(1, 48, 55),
            'punya_buku_kia' => fake()->boolean(),
        ];
    }
}