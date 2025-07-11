import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PosyanduContext } from "../contexts/PosyanduContext";

// State awal yang SANGAT LENGKAP untuk form Ibu
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
    kontrasepsi_sebelumnya: "Tidak Pakai",
    riwayat_penyakit: "",
    riwayat_alergi: "",
    punya_buku_kia: true,
    jaminan_kesehatan: "UMUM",
    nomor_jaminan_kesehatan: "",
    is_ktd: false,
    faskes_tk1: "",
    faskes_rujukan: "",
    no_registrasi_kohort: "",
    nama_suami: "",
    nik_suami: "",
    nomor_hp_suami: "",
    posyandu_id: "",
    email: "",
    password: "",
    password_confirmation: "",
    pendidikan: "SMA",
    pekerjaan: "Ibu Rumah Tangga",
    alamat_lengkap: "",
    rt: "",
    rw: "",
    jarak_kehamilan_bulan: "",
    kontrasepsi_lainnya: "",
    village_id: "",
};

const initialWilayahState = {
    province_id: "",
    regency_id: "",
    district_id: "",
};

export default function IbuPage() {
    const [ibus, setIbus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [error, setError] = useState("");
    const [editingIbu, setEditingIbu] = useState(null);
    const [hpl, setHpl] = useState("");
    const [step, setStep] = useState(1);

    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);
    const [selectedWilayah, setSelectedWilayah] = useState(initialWilayahState);

    const { posyandus } = useContext(PosyanduContext);
    const token = localStorage.getItem("auth_token");
    const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

    const fetchIbus = async () => {
        setLoading(true);
        try {
            const [ibuRes, provinceRes] = await Promise.all([
                axios.get("http://localhost:8000/api/ibus", API_CONFIG),
                axios.get(
                    "http://localhost:8000/api/wilayah/provinces",
                    API_CONFIG
                ),
            ]);
            setIbus(ibuRes.data);
            setProvinces(provinceRes.data);
        } catch (error) {
            console.error("Gagal mengambil data ibu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIbus();
    }, []);

    useEffect(() => {
        if (selectedWilayah.province_id) {
            axios
                .get(
                    `http://localhost:8000/api/wilayah/regencies?province_id=${selectedWilayah.province_id}`,
                    API_CONFIG
                )
                .then((res) => setRegencies(res.data));
        }
    }, [selectedWilayah.province_id]);
    useEffect(() => {
        if (selectedWilayah.regency_id) {
            axios
                .get(
                    `http://localhost:8000/api/wilayah/districts?regency_id=${selectedWilayah.regency_id}`,
                    API_CONFIG
                )
                .then((res) => setDistricts(res.data));
        }
    }, [selectedWilayah.regency_id]);
    useEffect(() => {
        if (selectedWilayah.district_id) {
            axios
                .get(
                    `http://localhost:8000/api/wilayah/villages?district_id=${selectedWilayah.district_id}`,
                    API_CONFIG
                )
                .then((res) => setVillages(res.data));
        }
    }, [selectedWilayah.district_id]);

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
        const finalValue = type === "checkbox" ? checked : value;
        const numericFields = [
            "nik",
            "nomor_kk",
            "kehamilan_ke",
            "jarak_kehamilan_bulan",
            "nomor_jaminan_kesehatan",
            "nik_suami",
            "nomor_hp_suami",
            "rt",
            "rw",
        ];

        if (name === "is_nik_exists") {
            setFormData((prev) => ({
                ...prev,
                [name]: finalValue,
                nik: "",
                nomor_kk: "",
            }));
        } else if (numericFields.includes(name)) {
            const numericValue = value.replace(/[^0-9]/g, "");
            setFormData((prev) => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: finalValue }));
        }
    };

    const handleWilayahChange = (e) => {
        const { name, value } = e.target;
        setSelectedWilayah((prev) => ({ ...prev, [name]: value }));
        if (name === "province_id") {
            setRegencies([]);
            setDistricts([]);
            setVillages([]);
            setSelectedWilayah({
                province_id: value,
                regency_id: "",
                district_id: "",
            });
        }
        if (name === "regency_id") {
            setDistricts([]);
            setVillages([]);
            setSelectedWilayah((prev) => ({ ...prev, district_id: "" }));
        }
        if (name === "district_id") {
            setVillages([]);
        }
        setFormData((prev) => ({ ...prev, posyandu_id: "" }));
    };

    const openTambahModal = () => {
        setEditingIbu(null);
        setFormData(initialFormState);
        setSelectedWilayah(initialWilayahState);
        setRegencies([]);
        setDistricts([]);
        setVillages([]);
        setHpl("");
        setError("");
        setStep(1);
        setIsModalOpen(true);
    };

    // --- FUNGSI EDIT YANG SUDAH DIPERBAIKI ---
    const openEditModal = (ibu) => {
        setEditingIbu(ibu);
        // Isi form dengan data yang ada, termasuk email dari relasi user
        setFormData({
            ...initialFormState,
            ...ibu,
            email: ibu.user.email,
            password: "",
            password_confirmation: "",
        });
        setError("");
        setStep(1); // Mulai dari langkah pertama
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        let finalFormData = { ...formData, hpl: hpl };
        if (formData.kontrasepsi_sebelumnya === "Lainnya") {
            finalFormData.kontrasepsi_sebelumnya = formData.kontrasepsi_lainnya;
        }

        const url = editingIbu
            ? `http://localhost:8000/api/ibus/${editingIbu.id}`
            : "http://localhost:8000/api/ibus";
        const method = editingIbu ? "put" : "post";
        try {
            const response = await axios[method](
                url,
                finalFormData,
                API_CONFIG
            );
            if (editingIbu) {
                setIbus(
                    ibus.map((i) =>
                        i.id === editingIbu.id ? response.data : i
                    )
                );
            } else {
                setIbus([response.data, ...ibus]);
            }
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

    const handleDelete = async (ibuId) => {
        if (
            window.confirm(
                "Yakin ingin menghapus data ibu ini? Aksi ini akan menghapus data anak yang terhubung."
            )
        ) {
            try {
                await axios.delete(
                    `http://localhost:8000/api/ibus/${ibuId}`,
                    API_CONFIG
                );
                setIbus(ibus.filter((i) => i.id !== ibuId));
            } catch (error) {
                alert("Gagal menghapus data ibu.");
            }
        }
    };

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

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                {loading ? (
                    <p className="p-4 text-center">Memuat data...</p>
                ) : (
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Nama Ibu
                                </th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase">
                                    NIK
                                </th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Nama Suami
                                </th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Posyandu
                                </th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {ibus.map((ibu) => (
                                <tr key={ibu.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-4 border-b text-sm">
                                        <p>{ibu.nama_lengkap}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <p>{ibu.nik || "N/A"}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <p>{ibu.nama_suami}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <p>{ibu.posyandu?.name || "N/A"}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    openEditModal(ibu)
                                                }
                                                className="text-yellow-600 hover:text-yellow-900"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(ibu.id)
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 md:p-8 rounded-lg w-full max-w-4xl shadow-xl">
                        <form
                            onSubmit={handleSubmit}
                            className="max-h-[85vh] overflow-y-auto pr-4"
                        >
                            <h2 className="text-2xl font-bold mb-6 sticky top-0 bg-white py-2 z-10">
                                {editingIbu
                                    ? "Edit Data Ibu"
                                    : "Tambah Data Ibu Baru"}{" "}
                                (Langkah {step} dari 6)
                            </h2>
                            {error && (
                                <p className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                                    {error}
                                </p>
                            )}

                            {/* ... (Semua langkah form dari step 1 sampai 6 sama persis seperti kode sebelumnya) ... */}

                            <div className="flex justify-between gap-4 mt-8 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Batal
                                </button>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(step - 1)}
                                        disabled={step === 1}
                                        className="flex items-center gap-2 px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                                    >
                                        <ArrowLeft size={16} /> Kembali
                                    </button>
                                    {step < 6 ? (
                                        <button
                                            type="button"
                                            onClick={() => setStep(step + 1)}
                                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Selanjutnya <ArrowRight size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            Simpan Data Ibu
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
