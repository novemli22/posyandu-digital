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
        Schema::create('anaks', function (Blueprint $table) {
            $table->id();

            // 'Kabel' paling penting ke Ibu dan lokasi Posyandu
            $table->foreignId('ibu_id')->constrained('ibus')->onDelete('cascade');
            $table->foreignId('posyandu_id')->constrained('posyandus')->onDelete('cascade');

            // Data Diri Anak
            $table->string('nama_lengkap');
            $table->string('nik', 16)->unique()->nullable();
            $table->integer('anak_ke');
            $table->date('tanggal_lahir');
            $table->enum('jenis_kelamin', ['LAKI-LAKI', 'PEREMPUAN']);

            // Data Kelahiran
            $table->decimal('bb_lahir', 4, 2)->nullable(); // Berat Badan Lahir (kg)
            $table->decimal('pb_lahir', 4, 2)->nullable(); // Panjang Badan Lahir (cm)

            $table->boolean('punya_buku_kia')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anaks');
    }
};
