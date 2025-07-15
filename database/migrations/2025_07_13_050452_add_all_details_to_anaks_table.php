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
            // Kolom untuk data manual jika Ibu tidak terdaftar
            $table->after('ibu_id', function ($table) {
                $table->boolean('is_ibu_terdaftar')->default(true);
                $table->string('nama_ibu_manual')->nullable();
                $table->string('nik_ibu_manual', 16)->nullable();
            });

            // Kolom untuk data anak itu sendiri
             $table->after('nik', function ($table) {
                $table->boolean('is_nik_exists')->default(true);
                $table->string('nomor_kk', 20)->nullable();
            });
            $table->after('pb_lahir', function ($table) {
                $table->boolean('is_imd')->default(false)->comment('Inisiasi Menyusu Dini');
            });

            // Kolom Alamat Anak (terpisah dari Ibu)
            $table->after('is_imd', function ($table) {
                $table->string('village_id', 10)->nullable();
                $table->text('alamat_lengkap')->nullable();
                $table->string('rt', 3)->nullable();
                $table->string('rw', 3)->nullable();
            });

            // Membuat kolom ibu_id boleh kosong
            $table->foreignId('ibu_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('anaks', function (Blueprint $table) {
            $table->dropColumn([
                'is_ibu_terdaftar', 
                'nama_ibu_manual', 
                'nik_ibu_manual',
                'is_nik_exists',
                'nomor_kk',
                'is_imd',
                'village_id',
                'alamat_lengkap',
                'rt',
                'rw'
            ]);
            
            $table->foreignId('ibu_id')->nullable(false)->change();
        });
    }
};
