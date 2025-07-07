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
            $table->after('nik', function ($table) {
                $table->boolean('is_nik_exists')->default(true);
                $table->string('nomor_kk', 20)->nullable();
            });
            $table->after('pb_lahir', function ($table) {
                $table->boolean('is_imd')->default(false)->comment('Inisiasi Menyusu Dini');
            });
        });
    }

    public function down(): void
    {
        Schema::table('anaks', function (Blueprint $table) {
            $table->dropColumn(['is_nik_exists', 'nomor_kk', 'is_imd']);
        });
    }
};
