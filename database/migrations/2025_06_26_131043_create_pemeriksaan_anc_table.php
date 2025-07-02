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
        Schema::create('pemeriksaan_anc', function (Blueprint $table) {
            $table->id();

            // 'Kabel' penghubung ke data Ibu, Kader, dan Posyandu
            $table->foreignId('ibu_id')->constrained('ibus')->onDelete('cascade');
            $table->foreignId('kader_id')->constrained('kaders')->onDelete('cascade');
            $table->foreignId('posyandu_id')->constrained('posyandus')->onDelete('cascade');

            // Data Pemeriksaan ANC (Antenatal Care)
            $table->date('tanggal_pemeriksaan');
            $table->integer('usia_kehamilan_minggu');
            $table->decimal('berat_badan', 5, 2);
            $table->string('tensi', 7)->comment('e.g., "120/80"');
            $table->decimal('lingkar_lengan_atas', 4, 1)->comment('LILA dalam cm');
            $table->decimal('tinggi_fundus', 4, 1)->comment('TFU dalam cm')->nullable();
            $table->integer('denyut_jantung_janin')->comment('DJJ per menit')->nullable();
            $table->integer('jumlah_tablet_fe_diberikan')->default(0);
            $table->string('status_imunisasi_tt')->nullable()->comment('e.g., "TT1", "TT2"');
            $table->string('hasil_lab_hb')->nullable()->comment('e.g., "11.5 g/dL"');
            $table->text('keluhan_ibu')->nullable();
            $table->text('saran_tindakan')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemeriksaan_anc');
    }
};
