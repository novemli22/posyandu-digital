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
        Schema::table('anaks', function (Blueprint $table) {
            // Tambahkan kolom-kolom baru ini setelah kolom 'ibu_id'
            $table->after('ibu_id', function ($table) {
                // "Saklar" untuk menentukan apakah ibu sudah terdaftar atau belum
                $table->boolean('is_ibu_terdaftar')->default(true);
                // Kolom untuk menyimpan data ibu secara manual jika tidak terdaftar
                $table->string('nama_ibu_manual')->nullable();
                $table->string('nik_ibu_manual', 16)->nullable();
            });
        });
    }

    public function down(): void
    {
        Schema::table('anaks', function (Blueprint $table) {
            // Hapus kolom jika migrasi di-rollback
            $table->dropColumn(['is_ibu_terdaftar', 'nama_ibu_manual', 'nik_ibu_manual']);
        });
    }
};
