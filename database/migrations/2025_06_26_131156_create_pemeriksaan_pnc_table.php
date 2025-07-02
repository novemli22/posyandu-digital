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
        Schema::create('pemeriksaan_pnc', function (Blueprint $table) {
            $table->id();

            // 'Kabel' penghubung
            $table->foreignId('ibu_id')->constrained('ibus')->onDelete('cascade');
            $table->foreignId('kader_id')->constrained('kaders')->onDelete('cascade');
            $table->foreignId('posyandu_id')->constrained('posyandus')->onDelete('cascade');

            // Data Pemeriksaan PNC (Postnatal Care)
            $table->date('tanggal_pemeriksaan');
            $table->integer('hari_ke_setelah_melahirkan')->comment('Kunjungan Nifas hari ke-...');
            $table->string('tensi', 7);
            $table->enum('pendarahan', ['NORMAL', 'ABNORMAL'])->default('NORMAL');
            $table->string('kondisi_perineum')->nullable()->comment('e.g., "Baik", "Bengkak", "Infeksi"');
            $table->boolean('pemberian_vitamin_a_nifas')->default(false);
            $table->boolean('konseling_kb')->default(false)->comment('Konseling Keluarga Berencana');
            $table->text('catatan_kesehatan_lain')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemeriksaan_pnc');
    }
};
