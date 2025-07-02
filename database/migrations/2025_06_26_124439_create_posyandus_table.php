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
        Schema::create('posyandus', function (Blueprint $table) {
            // ID unik otomatis dari Laravel (1, 2, 3, dst.)
            $table->id();

            // 'Kabel' untuk menyambung ke tabel desa/kelurahan
            $table->char('village_id', 10);

            // Kolom untuk nama Posyandu, e.g., "Posyandu Mawar 1"
            $table->string('name');
            $table->text('address')->nullable(); // Alamat lengkap Posyandu, boleh kosong
            $table->string('rt', 3)->nullable();
            $table->string('rw', 3)->nullable();

            // Kolom untuk melacak kapan data dibuat & diubah
            $table->timestamps();

            // Aturan 'sambungan kabel'-nya
            $table->foreign('village_id')
                ->references('id')
                ->on('villages')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posyandus');
    }
};
