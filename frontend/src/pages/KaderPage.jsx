import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function KaderPage() {
    const [kaders, setKaders] = useState([]);
    const [posyandus, setPosyandus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        nama_lengkap: "",
        email: "",
        password: "",
        password_confirmation: "",
        posyandu_id: "",
    });
    const [error, setError] = useState("");

    const token = localStorage.getItem("auth_token");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [kaderResponse, posyanduResponse] = await Promise.all([
                axios.get("http://localhost:8000/api/kaders", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get("http://localhost:8000/api/posyandu", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            setKaders(kaderResponse.data);
            setPosyandus(posyanduResponse.data);
        } catch (error) {
            console.error("Gagal mengambil data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await axios.post("http://localhost:8000/api/kaders", formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            if (err.response && err.response.status === 422) {
                const messages = Object.values(err.response.data.errors).flat();
                setError(messages[0]);
            } else {
                setError("Terjadi kesalahan pada server. Coba lagi nanti.");
            }
            console.error("Gagal menambah kader:", err.response);
        }
    };

    // --- FUNGSI HAPUS YANG SUDAH DI-UPGRADE ---
    const handleDelete = async (kaderId) => {
        if (
            window.confirm(
                "Apakah Anda yakin ingin menghapus kader ini? Aksi ini tidak bisa dibatalkan."
            )
        ) {
            try {
                await axios.delete(
                    `http://localhost:8000/api/kaders/${kaderId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                // LANGSUNG HAPUS DARI TAMPILAN TANPA MENGAMBIL ULANG SEMUA DATA
                setKaders(kaders.filter((kader) => kader.id !== kaderId));

                // alert('Kader berhasil dihapus!'); // Bisa ditambahkan jika perlu notifikasi sukses
            } catch (error) {
                console.error("Gagal menghapus kader:", error);
                alert("Gagal menghapus data kader.");
            }
        }
    };

    return (
        <div>
            {/* Header Halaman */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Manajemen Kader
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    Tambah Kader
                </button>
            </div>

            {/* Tabel Kader */}
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                {loading ? (
                    <p className="text-center p-4">Memuat data...</p>
                ) : (
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Nama Kader
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Posyandu Bertugas
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {kaders.map((kader) => (
                                <tr key={kader.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-4 border-b border-gray-200 text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">
                                            {kader.nama_lengkap}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">
                                            {kader.user.email}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">
                                            {kader.posyandu.name}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 text-sm">
                                        <div className="flex gap-2">
                                            <button className="text-yellow-600 hover:text-yellow-900">
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(kader.id)
                                                }
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal untuk Form Tambah Kader */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg w-full max-w-lg shadow-xl">
                        <h2 className="text-2xl font-bold mb-4">
                            Tambah Kader Baru
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {error && (
                                <p className="mb-4 rounded bg-red-100 p-3 text-center text-sm text-red-700">
                                    {error}
                                </p>
                            )}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    name="nama_lengkap"
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Konfirmasi Password
                                </label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Posyandu
                                </label>
                                <select
                                    name="posyandu_id"
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                >
                                    <option value="">Pilih Posyandu</option>
                                    {posyandus.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
