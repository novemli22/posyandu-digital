import React from "react";

export default function DashboardPage() {
    // Kita coba ambil data user yang sudah login dari localStorage
    const user = JSON.parse(localStorage.getItem("auth_user"));

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800">
                {/* Tampilkan nama user jika ada, jika tidak tampilkan 'Pengguna' */}
                Selamat Datang di Dashboard, {user ? user.name : "Pengguna"}!
            </h1>
            <p className="mt-2 text-gray-600">Anda telah berhasil login.</p>

            <div className="mt-6 p-4 bg-white rounded-lg shadow">
                <h2 className="font-semibold">Ini adalah area aman Anda.</h2>
                <p>
                    Nanti semua komponen dashboard seperti grafik dan tabel akan
                    ada di sini.
                </p>
            </div>
        </div>
    );
}
