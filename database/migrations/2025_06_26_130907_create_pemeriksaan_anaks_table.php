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
        Schema::create('pemeriksaan_anaks', function (Blueprint $table) {
            $table->id();

            // 'Kabel' penghubung
            $table->foreignId('anak_id')->constrained('anaks')->onDelete('cascade');
            $table->foreignId('kader_id')->constrained('kaders')->onDelete('cascade');
            $table->foreignId('posyandu_id')->constrained('posyandus')->onDelete('cascade');

            // Data Inti Pemeriksaan
            $table->date('tanggal_pemeriksaan');
            $table->decimal('berat_badan', 5, 2); // e.g., 10.50 kg
            $table->decimal('tinggi_badan', 5, 2); // e.g., 75.5 cm
            $table->decimal('lingkar_kepala', 5, 2)->nullable();
            $table->decimal('lingkar_lengan', 5, 2)->nullable();

            // Status Gizi (Hasil kalkulasi Z-Score oleh sistem nantinya)
            $table->string('status_gizi_bb_u')->nullable(); // Berat Badan/Umur
            $table->string('status_gizi_tb_u')->nullable(); // Tinggi Badan/Umur (Indikator Stunting)
            $table->string('status_gizi_bb_tb')->nullable(); // Berat Badan/Tinggi Badan (Indikator Wasting)

            // Intervensi
            $table->boolean('pemberian_vitamin_a')->default(false);
            $table->boolean('pemberian_obat_cacing')->default(false);
            $table->string('catatan_imunisasi')->nullable();

            // Lain-lain
            $table->text('catatan_kader')->nullable(); // Catatan tambahan dari kader

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemeriksaan_anaks');
    }
};
