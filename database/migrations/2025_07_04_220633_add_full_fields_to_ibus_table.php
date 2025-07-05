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
        Schema::table('ibus', function (Blueprint $table) {

            $table->after('tb_awal', function ($table) {
                $table->boolean('is_nik_exists')->default(true)->comment('Untuk ceklis jika NIK tidak ada');
                $table->integer('jarak_kehamilan_bulan')->nullable();
                $table->string('kontrasepsi_sebelumnya')->nullable();
                $table->string('nomor_jaminan_kesehatan')->nullable();
                $table->boolean('is_ktd')->default(false)->comment('Kehamilan Tidak Diinginkan');
                $table->string('faskes_tk1')->nullable();
                $table->string('faskes_rujukan')->nullable();
                $table->string('no_registrasi_kohort')->unique()->nullable();
            });

            // Kita juga buat kolom yang wajib diisi (tidak nullable)
            $table->string('nomor_hp_suami')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ibus', function (Blueprint $table) {
            $table->dropColumn([
            'is_nik_exists',
            'jarak_kehamilan_bulan',
            'kontrasepsi_sebelumnya',
            'nomor_jaminan_kesehatan',
            'is_ktd',
            'faskes_tk1',
            'faskes_rujukan',
            'no_registrasi_kohort',
        ]);

        // Kembalikan kolom nomor_hp_suami menjadi nullable
        $table->string('nomor_hp_suami')->nullable()->change();
        });
    }
};
