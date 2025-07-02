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
         Schema::create('districts', function (Blueprint $table) {
            // Perhatikan baik-baik baris ini: id adalah char(7)
            $table->char('id', 7)->primary();
            $table->char('regency_id', 4);
            $table->string('name', 255);
            $table->foreign('regency_id')
                ->references('id')
                ->on('regencies')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('districts');
    }
};
