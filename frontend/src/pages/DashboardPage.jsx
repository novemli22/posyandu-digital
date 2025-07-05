import React from "react";

export default function DashboardPage() {
    // Ambil data user dari localStorage untuk sapaan
    const user = JSON.parse(localStorage.getItem("auth_user"));

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">
                Selamat Datang, {user ? user.name : "Admin"}!
            </h1>
            <p className="mt-2">
                Ini adalah Dashboard Admin. Kamu berhasil login dan masuk ke
                area aman.
            </p>
        </div>
    );
}
