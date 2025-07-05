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
        Schema::table('kaders', function (Blueprint $table) {
            // Tambahkan kolom-kolom baru setelah kolom 'status'
            $table->after('status', function ($table) {
                // Alamat KTP
                $table->string('ktp_province_id', 2)->nullable();
                $table->string('ktp_regency_id', 4)->nullable();
                $table->string('ktp_district_id', 7)->nullable();
                $table->string('ktp_village_id', 10)->nullable();
                $table->text('ktp_address')->nullable();
                $table->string('ktp_rt', 3)->nullable();
                $table->string('ktp_rw', 3)->nullable();

                // Alamat Domisili
                $table->boolean('domisili_sesuai_ktp')->default(true);
                $table->string('domisili_province_id', 2)->nullable();
                $table->string('domisili_regency_id', 4)->nullable();
                $table->string('domisili_district_id', 7)->nullable();
                $table->string('domisili_village_id', 10)->nullable();
                $table->text('domisili_address')->nullable();
                $table->string('domisili_rt', 3)->nullable();
                $table->string('domisili_rw', 3)->nullable();

                // Kepemilikan JKN
                $table->boolean('memiliki_jkn')->default(false);

                // Riwayat Pelatihan
                $table->boolean('pelatihan_posyandu')->default(false);
                $table->boolean('pelatihan_ibu_hamil')->default(false);
                $table->boolean('pelatihan_balita')->default(false);

                // Tanda Kecakapan Kader (TKK)
                $table->integer('tkk_posyandu')->default(0);
                $table->integer('tkk_ibu_hamil')->default(0);
                $table->integer('tkk_balita')->default(0);
            });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kaders', function (Blueprint $table) {
            // Hapus kolom jika migrasi di-rollback
            $table->dropColumn([
                'ktp_province_id', 'ktp_regency_id', 'ktp_district_id', 'ktp_village_id', 'ktp_address', 'ktp_rt', 'ktp_rw',
                'domisili_sesuai_ktp', 'domisili_province_id', 'domisili_regency_id', 'domisili_district_id', 'domisili_village_id', 'domisili_address', 'domisili_rt', 'domisili_rw',
                'memiliki_jkn', 'pelatihan_posyandu', 'pelatihan_ibu_hamil', 'pelatihan_balita',
                'tkk_posyandu', 'tkk_ibu_hamil', 'tkk_balita'
            ]);
        });
    }
};
