import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Plus, Edit, Trash2 } from "lucide-react";
import { PosyanduContext } from "../contexts/PosyanduContext";

// State awal yang lengkap untuk form Ibu
const initialFormState = {
    nama_lengkap: "",
    nik: "",
    nomor_kk: "",
    tanggal_lahir: "",
    is_nik_exists: true,
    kehamilan_ke: 1,
    bb_awal: "",
    tb_awal: "",
    hpht: "",
    golongan_darah: "A",
    kontrasepsi_sebelumnya: "",
    riwayat_penyakit: "",
    riwayat_alergi: "",
    punya_buku_kia: true,
    jaminan_kesehatan: "UMUM",
    nomor_jaminan_kesehatan: "",
    is_ktd: false,
    faskes_tk1: "",
    faskes_rujukan: "",
    nama_suami: "",
    nik_suami: "",
    nomor_hp_suami: "",
    posyandu_id: "",
    email: "",
    password: "",
    password_confirmation: "",
};

export default function IbuPage() {
    const [ibus, setIbus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [error, setError] = useState("");
    const [editingIbu, setEditingIbu] = useState(null);

    // HPL (Hari Perkiraan Lahir) akan kita hitung di state terpisah
    const [hpl, setHpl] = useState("");

    const posyandus = useContext(PosyanduContext);
    const token = localStorage.getItem("auth_token");
    const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

    // --- LOGIKA ---
    const fetchIbus = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                "http://localhost:8000/api/ibus",
                API_CONFIG
            );
            setIbus(response.data);
        } catch (error) {
            console.error("Gagal mengambil data ibu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIbus();
    }, []);

    // useEffect untuk menghitung HPL secara otomatis saat HPHT berubah
    useEffect(() => {
        if (formData.hpht) {
            const hphtDate = new Date(formData.hpht);
            hphtDate.setDate(hphtDate.getDate() + 7);
            hphtDate.setMonth(hphtDate.getMonth() - 3);
            hphtDate.setFullYear(hphtDate.getFullYear() + 1);
            setHpl(hphtDate.toISOString().split("T")[0]);
        } else {
            setHpl("");
        }
    }, [formData.hpht]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const openTambahModal = () => {
        setEditingIbu(null);
        setFormData(initialFormState);
        setHpl("");
        setError("");
        setIsModalOpen(true);
    };

    // (Fungsi openEditModal dan Delete bisa kita sempurnakan nanti)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const finalFormData = { ...formData, hpl: hpl }; // Sertakan HPL saat submit

        // ... (Logika handleSubmit sama seperti sebelumnya) ...
        try {
            const response = await axios.post(
                "http://localhost:8000/api/ibus",
                finalFormData,
                API_CONFIG
            );
            setIbus([response.data, ...ibus]);
            setIsModalOpen(false);
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setError(
                    Object.values(err.response.data.errors).flat().join(" ")
                );
            } else {
                setError("Terjadi kesalahan pada server.");
            }
        }
    };

    // ... (Tampilan Tabel sama seperti sebelumnya) ...

    // === TAMPILAN (JSX) ===
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Manajemen Ibu
                </h1>
                <button
                    onClick={openTambahModal}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
                >
                    <Plus size={20} />
                    Tambah Ibu
                </button>
            </div>

            {/* Di sini seharusnya ada tabel untuk menampilkan data Ibu */}
            <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-center text-gray-500">
                    (Tabel data Ibu akan ditampilkan di sini)
                </p>
            </div>

            {/* Modal Form Lengkap */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 md:p-8 rounded-lg w-full max-w-4xl shadow-xl">
                        <form
                            onSubmit={handleSubmit}
                            className="max-h-[85vh] overflow-y-auto pr-4"
                        >
                            <h2 className="text-2xl font-bold mb-6 sticky top-0 bg-white py-2">
                                {editingIbu
                                    ? "Edit Data Ibu"
                                    : "Tambah Data Ibu Baru"}
                            </h2>
                            {error && (
                                <p className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                                    {error}
                                </p>
                            )}

                            {/* --- DATA DIRI IBU --- */}
                            <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                Data Diri Ibu
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm">
                                        Nama Lengkap*
                                    </label>
                                    <input
                                        type="text"
                                        name="nama_lengkap"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        Tanggal Lahir*
                                    </label>
                                    <input
                                        type="date"
                                        name="tanggal_lahir"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        Nomor KK*
                                    </label>
                                    <input
                                        type="text"
                                        name="nomor_kk"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        NIK*
                                    </label>
                                    <input
                                        type="text"
                                        name="nik"
                                        onChange={handleInputChange}
                                        disabled={!formData.is_nik_exists}
                                        className="mt-1 w-full rounded disabled:bg-gray-200"
                                        required={formData.is_nik_exists}
                                    />
                                </div>
                                <div className="flex items-center pt-5">
                                    <input
                                        type="checkbox"
                                        name="is_nik_exists"
                                        checked={!formData.is_nik_exists}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                is_nik_exists:
                                                    !e.target.checked,
                                            })
                                        }
                                        className="mr-2 h-4 w-4"
                                    />
                                    <span>Belum Punya NIK</span>
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        Pendidikan
                                    </label>
                                    <input
                                        type="text"
                                        name="pendidikan"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        Pekerjaan
                                    </label>
                                    <input
                                        type="text"
                                        name="pekerjaan"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        Golongan Darah
                                    </label>
                                    <select
                                        name="golongan_darah"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                    >
                                        <option>A</option>
                                        <option>B</option>
                                        <option>AB</option>
                                        <option>O</option>
                                        <option>TIDAK TAHU</option>
                                    </select>
                                </div>
                            </div>

                            {/* --- DATA SUAMI --- */}
                            <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4 mt-6">
                                Data Suami
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm">
                                        Nama Suami*
                                    </label>
                                    <input
                                        type="text"
                                        name="nama_suami"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        NIK Suami
                                    </label>
                                    <input
                                        type="text"
                                        name="nik_suami"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        No. HP Suami*
                                    </label>
                                    <input
                                        type="text"
                                        name="nomor_hp_suami"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                        required
                                    />
                                </div>
                            </div>

                            {/* --- DATA KEHAMILAN --- */}
                            <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4 mt-6">
                                Data Kehamilan & Kesehatan
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm">
                                        Kehamilan Ke-*
                                    </label>
                                    <input
                                        type="number"
                                        name="kehamilan_ke"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        HPHT*
                                    </label>
                                    <input
                                        type="date"
                                        name="hpht"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        HPL (Otomatis)
                                    </label>
                                    <input
                                        type="date"
                                        name="hpl"
                                        value={hpl}
                                        readOnly
                                        className="mt-1 w-full rounded bg-gray-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        BB Awal (kg)*
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="bb_awal"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        TB Awal (cm)*
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="tb_awal"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        Kontrasepsi Sebelumnya
                                    </label>
                                    <input
                                        type="text"
                                        name="kontrasepsi_sebelumnya"
                                        className="mt-1 w-full rounded"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm">
                                        Riwayat Penyakit
                                    </label>
                                    <input
                                        type="text"
                                        name="riwayat_penyakit"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm">
                                        Riwayat Alergi
                                    </label>
                                    <input
                                        type="text"
                                        name="riwayat_alergi"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                    />
                                </div>
                                <div className="flex items-center pt-5">
                                    <input
                                        type="checkbox"
                                        name="punya_buku_kia"
                                        checked={formData.punya_buku_kia}
                                        onChange={handleInputChange}
                                        className="mr-2 h-4 w-4"
                                    />
                                    <span>Punya Buku KIA</span>
                                </div>
                                <div className="flex items-center pt-5">
                                    <input
                                        type="checkbox"
                                        name="is_ktd"
                                        checked={formData.is_ktd}
                                        onChange={handleInputChange}
                                        className="mr-2 h-4 w-4"
                                    />
                                    <span>Kehamilan Tidak Diinginkan</span>
                                </div>
                            </div>

                            {/* --- DATA ADMINISTRASI --- */}
                            <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4 mt-6">
                                Data Administrasi & Faskes
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm">
                                        Jaminan Kesehatan
                                    </label>
                                    <select
                                        name="jaminan_kesehatan"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                    >
                                        <option>UMUM</option>
                                        <option>BPJS</option>
                                        <option>KIS</option>
                                        <option>LAINNYA</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm">
                                        No. Jaminan Kesehatan
                                    </label>
                                    <input
                                        type="text"
                                        name="nomor_jaminan_kesehatan"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        No. Reg. Kohort Ibu
                                    </label>
                                    <input
                                        type="text"
                                        name="no_registrasi_kohort"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        Faskes TK 1
                                    </label>
                                    <input
                                        type="text"
                                        name="faskes_tk1"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        Faskes Rujukan
                                    </label>
                                    <input
                                        type="text"
                                        name="faskes_rujukan"
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                    />
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
