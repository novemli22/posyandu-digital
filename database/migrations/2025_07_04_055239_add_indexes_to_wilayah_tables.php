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
        Schema::table('regencies', function (Blueprint $table) {
        $table->index('province_id');
        });
        Schema::table('districts', function (Blueprint $table) {
            $table->index('regency_id');
        });
        Schema::table('villages', function (Blueprint $table) {
            $table->index('district_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wilayah_tables', function (Blueprint $table) {
            //
        });
    }
};
