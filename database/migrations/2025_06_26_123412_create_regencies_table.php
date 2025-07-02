<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('regencies', function (Blueprint $table) {
            // Kolom untuk kode kab/kota 4 digit (misal: '5303' untuk Kab. Kupang)
            $table->char('id', 4)->primary();

            // Ini 'kabel' untuk menyambung ke tabel provinsi
            $table->char('province_id', 2);

            // Kolom untuk nama kabupaten/kota
            $table->string('name', 255);

            // Ini aturan 'sambungan kabel'-nya (Foreign Key)
            $table->foreign('province_id')
                ->references('id')
                ->on('provinces')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('regencies');
    }
};
