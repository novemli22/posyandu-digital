import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // Kita asumsikan backend Laravel berjalan di port 8000
            const response = await axios.post(
                "http://localhost:8000/api/login",
                {
                    email: email,
                    password: password,
                }
            );

            // Simpan token dan data user di browser
            localStorage.setItem("auth_token", response.data.access_token);
            localStorage.setItem(
                "auth_user",
                JSON.stringify(response.data.user)
            );

            // Arahkan pengguna ke dashboard admin
            navigate("/admin/dashboard");
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError("Email atau password salah.");
            } else {
                setError("Terjadi kesalahan pada server. Coba lagi nanti.");
            }
            console.error("Login gagal:", err);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">
                    Login Admin
                </h2>
                <form onSubmit={handleLogin}>
                    {error && (
                        <p className="mb-4 rounded bg-red-100 p-3 text-center text-red-700">
                            {error}
                        </p>
                    )}
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Alamat Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
