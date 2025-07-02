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
        Schema::create('villages', function (Blueprint $table) {
            $table->char('id', 10)->primary();
            // Perhatikan baik-baik baris ini: district_id adalah char(7), sama seperti id di tabel districts
            $table->char('district_id', 7);
            $table->string('name', 255);
            $table->foreign('district_id')
                ->references('id')
                ->on('districts')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('villages');
    }
};
