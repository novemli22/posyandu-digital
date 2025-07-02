<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Posyandu>
 */
class PosyanduFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // village_id akan kita isi nanti di seeder
            'name'    => 'Posyandu ' . fake()->randomElement(['Mawar', 'Melati', 'Anggrek', 'Kamboja']) . ' ' . fake()->numerify('#'),
            'address' => fake()->address(),
            'rt'      => fake()->numerify('00#'),
            'rw'      => fake()->numerify('00#'),
        ];
    }
}
