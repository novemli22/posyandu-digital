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
        Schema::create('kaders', function (Blueprint $table) {
            $table->id();

            // 'Kabel' penghubung ke data login & lokasi tugas
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('posyandu_id')->constrained('posyandus')->onDelete('cascade');

            // Biodata Kader
            $table->string('nama_lengkap');
            $table->string('nik', 16)->unique()->nullable();
            $table->string('nomor_hp', 25)->unique()->nullable();
            $table->string('tempat_lahir')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->enum('jenis_kelamin', ['LAKI-LAKI', 'PEREMPUAN']);
            $table->text('alamat')->nullable();
            $table->enum('status', ['AKTIF', 'TIDAK AKTIF'])->default('AKTIF');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kaders');
    }
};
