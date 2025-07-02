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
        Schema::create('ibus', function (Blueprint $table) {
            $table->id();

            // --- Kabel Penghubung ---
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('posyandu_id')->constrained('posyandus')->onDelete('cascade');

            // --- Data Diri Ibu ---
            $table->string('nama_lengkap');
            $table->string('nik', 16)->unique()->nullable();
            $table->string('nomor_kk', 16)->unique();
            $table->date('tanggal_lahir');
            $table->enum('golongan_darah', ['A', 'B', 'AB', 'O', 'TIDAK TAHU'])->default('TIDAK TAHU');
            $table->enum('pendidikan', ['TIDAK SEKOLAH', 'SD', 'SMP', 'SMA', 'DIPLOMA', 'S1', 'S2/S3'])->nullable();
            $table->string('pekerjaan')->nullable();

            // --- Data Suami ---
            $table->string('nama_suami')->nullable();
            $table->string('nik_suami', 16)->nullable();
            $table->string('nomor_hp_suami')->nullable();

            // --- Alamat ---
            $table->text('alamat_lengkap');
            $table->string('rt', 3)->nullable();
            $table->string('rw', 3)->nullable();

            // --- Data Kehamilan & Kesehatan ---
            $table->integer('kehamilan_ke');
            $table->date('hpht');
            $table->date('hpl');
            $table->decimal('bb_awal', 5, 2); 
            $table->decimal('tb_awal', 5, 2);
            $table->text('riwayat_penyakit')->nullable();
            $table->text('riwayat_alergi')->nullable();
            $table->boolean('punya_buku_kia')->default(true);
            $table->enum('jaminan_kesehatan', ['BPJS', 'KIS', 'ASURANSI LAIN', 'UMUM'])->default('UMUM');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ibus');
    }
};
