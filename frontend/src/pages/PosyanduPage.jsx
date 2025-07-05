import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2 } from "lucide-react";

const initialFormState = {
    name: "",
    address: "",
    rt: "",
    rw: "",
    village_id: "",
};
const initialWilayahState = {
    province_id: "",
    regency_id: "",
    district_id: "",
};

export default function PosyanduPage() {
    const [posyandus, setPosyandus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [error, setError] = useState("");
    const [editingPosyandu, setEditingPosyandu] = useState(null);

    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);
    const [selectedWilayah, setSelectedWilayah] = useState(initialWilayahState);

    const token = localStorage.getItem("auth_token");
    const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [posyanduRes, provinceRes] = await Promise.all([
                axios.get("http://localhost:8000/api/posyandus", API_CONFIG),
                axios.get(
                    "http://localhost:8000/api/wilayah/provinces",
                    API_CONFIG
                ),
            ]);
            setPosyandus(posyanduRes.data);
            setProvinces(provinceRes.data);
        } catch (error) {
            console.error("Gagal mengambil data awal:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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

    const handleWilayahChange = (e) => {
        const { name, value } = e.target;
        const newWilayah = { ...selectedWilayah, [name]: value };
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
        setSelectedWilayah(newWilayah);
        setFormData((prev) => ({ ...prev, village_id: "" }));
    };

    const handleInputChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const openTambahModal = () => {
        setEditingPosyandu(null);
        setFormData(initialFormState);
        setSelectedWilayah(initialWilayahState);
        setRegencies([]);
        setDistricts([]);
        setVillages([]);
        setError("");
        setIsModalOpen(true);
    };

    // --- FUNGSI EDIT YANG SUDAH DIPERBAIKI ---
    const openEditModal = (posyandu) => {
        setEditingPosyandu(posyandu);
        setFormData({
            name: posyandu.name,
            address: posyandu.address,
            rt: posyandu.rt,
            rw: posyandu.rw,
            village_id: posyandu.village_id,
        });

        // Ini bagian penting: atur semua dropdown wilayah
        // dan biarkan useEffect yang mengurus pemanggilan API untuk mengisi opsinya
        if (posyandu.village?.district?.regency?.province) {
            const provId = posyandu.village.district.regency.province.id;
            const regId = posyandu.village.district.id;
            const distId = posyandu.village.id;

            setSelectedWilayah({
                province_id: provId,
                regency_id: regId,
                district_id: distId,
            });
        }

        setError("");
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.village_id) {
            setError("Desa/Kelurahan wajib dipilih.");
            return;
        }
        setError("");
        const url = editingPosyandu
            ? `http://localhost:8000/api/posyandus/${editingPosyandu.id}`
            : "http://localhost:8000/api/posyandus";
        const method = editingPosyandu ? "put" : "post";
        try {
            const response = await axios[method](url, formData, API_CONFIG);
            if (editingPosyandu) {
                setPosyandus(
                    posyandus.map((p) =>
                        p.id === editingPosyandu.id ? response.data : p
                    )
                );
            } else {
                setPosyandus([response.data, ...posyandus]);
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

    const handleDelete = async (posyanduId) => {
        if (window.confirm("Yakin ingin menghapus data posyandu ini?")) {
            try {
                await axios.delete(
                    `http://localhost:8000/api/posyandus/${posyanduId}`,
                    API_CONFIG
                );
                setPosyandus(posyandus.filter((p) => p.id !== posyanduId));
            } catch (error) {
                alert("Gagal menghapus data posyandu.");
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manajemen Posyandu</h1>
                <button
                    onClick={openTambahModal}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
                >
                    <Plus size={20} /> Tambah Posyandu
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                {loading ? (
                    <p className="p-4 text-center">Memuat data...</p>
                ) : (
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">
                                    Nama Posyandu
                                </th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">
                                    Alamat
                                </th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">
                                    Desa/Kelurahan
                                </th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">
                                    Kecamatan
                                </th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {posyandus.map((posyandu) => (
                                <tr
                                    key={posyandu.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-5 py-4 border-b text-sm">
                                        <p>{posyandu.name}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <p>{`RT ${posyandu.rt}/${posyandu.rw}, ${posyandu.address}`}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <p>{posyandu.village?.name || "N/A"}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <p>
                                            {posyandu.village?.district?.name ||
                                                "N/A"}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    openEditModal(posyandu)
                                                }
                                                className="text-yellow-600 hover:text-yellow-900"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(posyandu.id)
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
                    <div className="bg-white p-8 rounded-lg w-full max-w-2xl shadow-xl overflow-y-auto max-h-screen">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingPosyandu
                                ? "Edit Posyandu"
                                : "Tambah Posyandu Baru"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {error && (
                                <p className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                                    {error}
                                </p>
                            )}
                            <div className="mb-4">
                                <label className="block text-sm font-medium">
                                    Nama Posyandu
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                            <hr className="my-4" />
                            <p className="text-sm font-medium mb-2">
                                Pilih Lokasi
                            </p>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm">
                                        Provinsi
                                    </label>
                                    <select
                                        name="province_id"
                                        value={selectedWilayah.province_id}
                                        onChange={handleWilayahChange}
                                        className="mt-1 w-full rounded border-gray-300 shadow-sm"
                                        required
                                    >
                                        <option value="">Pilih Provinsi</option>
                                        {provinces.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        Kabupaten/Kota
                                    </label>
                                    <select
                                        name="regency_id"
                                        value={selectedWilayah.regency_id}
                                        onChange={handleWilayahChange}
                                        className="mt-1 w-full rounded border-gray-300 shadow-sm"
                                        required
                                        disabled={regencies.length === 0}
                                    >
                                        <option value="">
                                            Pilih Kabupaten/Kota
                                        </option>
                                        {regencies.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        Kecamatan
                                    </label>
                                    <select
                                        name="district_id"
                                        value={selectedWilayah.district_id}
                                        onChange={handleWilayahChange}
                                        className="mt-1 w-full rounded border-gray-300 shadow-sm"
                                        required
                                        disabled={districts.length === 0}
                                    >
                                        <option value="">
                                            Pilih Kecamatan
                                        </option>
                                        {districts.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        Desa/Kelurahan
                                    </label>
                                    <select
                                        name="village_id"
                                        value={formData.village_id}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded border-gray-300 shadow-sm"
                                        required
                                        disabled={villages.length === 0}
                                    >
                                        <option value="">
                                            Pilih Desa/Kelurahan
                                        </option>
                                        {villages.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <hr className="my-4" />
                            <p className="text-sm font-medium mb-2">
                                Detail Alamat
                            </p>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">
                                    Alamat Lengkap (Jalan/Dusun)
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm">RT</label>
                                    <input
                                        type="text"
                                        name="rt"
                                        value={formData.rt}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded border-gray-300 shadow-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">RW</label>
                                    <input
                                        type="text"
                                        name="rw"
                                        value={formData.rw}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded border-gray-300 shadow-sm"
                                        required
                                    />
                                </div>
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
