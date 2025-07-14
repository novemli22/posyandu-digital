<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::table('ibus', function (Blueprint $table) {
            // Tambahkan kolom baru setelah kolom 'kontrasepsi_sebelumnya'
            // Ini untuk menyimpan input manual jika pengguna memilih "Lainnya"
            $table->after('kontrasepsi_sebelumnya', function ($table) {
                $table->string('kontrasepsi_lainnya')->nullable();
            });
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('ibus', function (Blueprint $table) {
            // Hapus kolom jika migrasi di-rollback
            $table->dropColumn('kontrasepsi_lainnya');
        });
    }
};
