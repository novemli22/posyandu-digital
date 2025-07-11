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
        Schema::table('posyandus', function (Blueprint $table) {
            // Tambahkan kolom baru setelah kolom 'rw'
            $table->after('rw', function ($table) {
                $table->string('puskesmas_pembina')->nullable();
            });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posyandus', function (Blueprint $table) {
            $table->dropColumn('puskesmas_pembina');
        });
    }
};
