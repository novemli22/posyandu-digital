import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PosyanduContext } from "../contexts/PosyanduContext";

// State awal yang bersih untuk form Anak
const initialFormState = {
    is_ibu_terdaftar: true,
    ibu_id: "",
    // Data Ibu Manual
    nama_ibu_manual: "",
    nik_ibu_manual: "",
    nomor_hp_ibu_manual: "",
    email: "",
    password: "",
    password_confirmation: "",
    // Data Anak
    nama_lengkap: "",
    is_nik_exists: true,
    nik: "",
    nomor_kk: "",
    anak_ke: "",
    tanggal_lahir: "",
    jenis_kelamin: "LAKI-LAKI",
    bb_lahir: "",
    pb_lahir: "",
    punya_buku_kia: true,
    is_imd: false,
    // Data Alamat & Posyandu
    posyandu_id: "",
    alamat_lengkap: "",
    rt: "",
    rw: "",
    village_id: "",
};

const initialWilayahState = {
    province_id: "",
    regency_id: "",
    district_id: "",
};

export default function AnakPage() {
    const [anaks, setAnaks] = useState([]);
    const [ibus, setIbus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [error, setError] = useState("");
    const [editingAnak, setEditingAnak] = useState(null);
    const [step, setStep] = useState(1);

    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);
    const [selectedWilayah, setSelectedWilayah] = useState(initialWilayahState);
    const [filteredPosyandus, setFilteredPosyandus] = useState([]);
    const [selectedIbuData, setSelectedIbuData] = useState(null);

    const { posyandus: allPosyandus } = useContext(PosyanduContext);
    const token = localStorage.getItem("auth_token");
    const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

    const fetchData = async (page) => {
        setLoading(true);
        try {
            const [anakRes, ibuRes, provinceRes] = await Promise.all([
                axios.get(
                    `http://localhost:8000/api/anaks?page=${page}`,
                    API_CONFIG
                ),
                axios.get("http://localhost:8000/api/ibus", API_CONFIG),
                axios.get(
                    "http://localhost:8000/api/wilayah/provinces",
                    API_CONFIG
                ),
            ]);
            setAnaks(anakRes.data.data);
            setPagination(anakRes.data);
            setIbus(ibuRes.data);
            setProvinces(provinceRes.data);
        } catch (error) {
            console.error("Gagal mengambil data awal:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage]);

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
        if (formData.ibu_id && formData.is_ibu_terdaftar) {
            const selected = ibus.find(
                (i) => i.id === parseInt(formData.ibu_id)
            );
            setSelectedIbuData(selected || null);
            if (selected) {
                setFormData((prev) => ({
                    ...prev,
                    nomor_kk: selected.nomor_kk || "",
                    alamat_lengkap: selected.alamat_lengkap || "",
                    rt: selected.rt || "",
                    rw: selected.rw || "",
                    village_id: selected.posyandu?.village_id || "",
                    posyandu_id: selected.posyandu_id || "",
                }));
            }
        } else {
            setSelectedIbuData(null);
        }
    }, [formData.ibu_id, ibus, formData.is_ibu_terdaftar]);

    useEffect(() => {
        if (formData.village_id && allPosyandus) {
            const relevantPosyandus = allPosyandus.filter(
                (p) => p.village_id === formData.village_id
            );
            setFilteredPosyandus(relevantPosyandus);
        } else {
            setFilteredPosyandus([]);
        }
    }, [formData.village_id, allPosyandus]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === "checkbox" ? checked : value;
        const numericFields = [
            "nik",
            "nomor_kk",
            "anak_ke",
            "bb_lahir",
            "pb_lahir",
            "nik_ibu_manual",
            "rt",
            "rw",
            "nomor_hp_ibu_manual",
        ];

        if (name === "is_ibu_terdaftar") {
            setFormData({ ...initialFormState, is_ibu_terdaftar: finalValue });
            setSelectedWilayah(initialWilayahState);
            setRegencies([]);
            setDistricts([]);
            setVillages([]);
        } else if (name === "is_nik_exists") {
            setFormData((prev) => ({ ...prev, [name]: finalValue, nik: "" }));
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
        setFormData((prev) => ({ ...prev, village_id: "", posyandu_id: "" }));
    };

    const openTambahModal = () => {
        setEditingAnak(null);
        setFormData(initialFormState);
        setSelectedWilayah(initialWilayahState);
        setRegencies([]);
        setDistricts([]);
        setVillages([]);
        setError("");
        setStep(1);
        setIsModalOpen(true);
    };

    const openEditModal = (anak) => {
        /* ... (akan kita sempurnakan nanti) ... */
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const url = editingAnak
            ? `http://localhost:8000/api/anaks/${editingAnak.id}`
            : "http://localhost:8000/api/anaks";
        const method = editingAnak ? "put" : "post";
        try {
            await axios[method](url, formData, API_CONFIG);
            fetchData(editingAnak ? currentPage : 1);
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

    const handleDelete = async (anakId) => {
        if (window.confirm("Yakin ingin menghapus data anak ini?")) {
            try {
                await axios.delete(
                    `http://localhost:8000/api/anaks/${anakId}`,
                    API_CONFIG
                );
                fetchData(currentPage);
            } catch (error) {
                alert("Gagal menghapus data anak.");
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manajemen Anak</h1>
                <button
                    onClick={openTambahModal}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
                >
                    <Plus size={20} /> Tambah Anak
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
                                    Nama Anak
                                </th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">
                                    Nama Ibu
                                </th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">
                                    Tgl Lahir
                                </th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">
                                    Posyandu
                                </th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {anaks.map((anak) => (
                                <tr key={anak.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-4 border-b text-sm">
                                        <p>{anak.nama_lengkap}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <p>
                                            {anak.ibu?.nama_lengkap ||
                                                anak.nama_ibu_manual ||
                                                "N/A"}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <p>{anak.tanggal_lahir}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <p>{anak.posyandu?.name || "N/A"}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    openEditModal(anak)
                                                }
                                                className="text-yellow-600"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(anak.id)
                                                }
                                                className="text-red-600"
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
                        <form onSubmit={handleSubmit}>
                            <h2 className="text-2xl font-bold mb-6">
                                {editingAnak
                                    ? "Edit Data Anak"
                                    : "Tambah Anak Baru"}{" "}
                                (Langkah {step} dari 4)
                            </h2>
                            {error && (
                                <p className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                                    {error}
                                </p>
                            )}

                            <div className="mb-4 flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_ibu_terdaftar"
                                    name="is_ibu_terdaftar"
                                    checked={formData.is_ibu_terdaftar}
                                    onChange={handleInputChange}
                                    className="mr-2 h-4 w-4"
                                />
                                <label
                                    htmlFor="is_ibu_terdaftar"
                                    className="text-sm font-medium"
                                >
                                    Orang Tua Sudah Terdaftar di Sistem
                                </label>
                            </div>
                            {formData.is_ibu_terdaftar && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium">
                                        Pilih Orang Tua*
                                    </label>
                                    <select
                                        name="ibu_id"
                                        value={formData.ibu_id}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded"
                                        required
                                    >
                                        <option value="">Pilih Ibu</option>
                                        {ibus.map((i) => (
                                            <option key={i.id} value={i.id}>
                                                {i.nama_lengkap} - NIK:{" "}
                                                {i.nik || "N/A"}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <hr className="my-6" />

                            {step === 1 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                        1. Data Diri & Alamat Anak
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm">
                                                Nama Lengkap*
                                            </label>
                                            <input
                                                type="text"
                                                name="nama_lengkap"
                                                value={formData.nama_lengkap}
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
                                                value={formData.tanggal_lahir}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                Anak ke-*
                                            </label>
                                            <input
                                                type="number"
                                                name="anak_ke"
                                                value={formData.anak_ke}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                Jenis Kelamin*
                                            </label>
                                            <select
                                                name="jenis_kelamin"
                                                value={formData.jenis_kelamin}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                                required
                                            >
                                                <option value="LAKI-LAKI">
                                                    Laki-laki
                                                </option>
                                                <option value="PEREMPUAN">
                                                    Perempuan
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="is_nik_exists"
                                                name="is_nik_exists"
                                                checked={formData.is_nik_exists}
                                                onChange={handleInputChange}
                                                className="mr-2 h-4 w-4"
                                            />
                                            <label
                                                htmlFor="is_nik_exists"
                                                className="text-sm font-medium"
                                            >
                                                Anak Memiliki NIK
                                            </label>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <label className="block text-sm">
                                                NIK Anak
                                            </label>
                                            <input
                                                type="text"
                                                name="nik"
                                                value={formData.nik}
                                                onChange={handleInputChange}
                                                disabled={
                                                    !formData.is_nik_exists
                                                }
                                                className="mt-1 w-full rounded disabled:bg-gray-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                Nomor KK*
                                            </label>
                                            <input
                                                type="text"
                                                name="nomor_kk"
                                                value={formData.nomor_kk}
                                                onChange={handleInputChange}
                                                disabled={
                                                    formData.is_ibu_terdaftar
                                                }
                                                className="mt-1 w-full rounded disabled:bg-gray-200"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="block text-sm">
                                                Provinsi*
                                            </label>
                                            <select
                                                name="province_id"
                                                value={
                                                    selectedWilayah.province_id
                                                }
                                                onChange={handleWilayahChange}
                                                className="mt-1 w-full rounded"
                                                required
                                                disabled={
                                                    formData.is_ibu_terdaftar
                                                }
                                            >
                                                <option value="">Pilih</option>
                                                {provinces.map((p) => (
                                                    <option
                                                        key={p.id}
                                                        value={p.id}
                                                    >
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                Kab/Kota*
                                            </label>
                                            <select
                                                name="regency_id"
                                                value={
                                                    selectedWilayah.regency_id
                                                }
                                                onChange={handleWilayahChange}
                                                className="mt-1 w-full rounded"
                                                disabled={
                                                    !selectedWilayah.province_id ||
                                                    formData.is_ibu_terdaftar
                                                }
                                            >
                                                <option value="">Pilih</option>
                                                {regencies.map((r) => (
                                                    <option
                                                        key={r.id}
                                                        value={r.id}
                                                    >
                                                        {r.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                Kecamatan*
                                            </label>
                                            <select
                                                name="district_id"
                                                value={
                                                    selectedWilayah.district_id
                                                }
                                                onChange={handleWilayahChange}
                                                className="mt-1 w-full rounded"
                                                disabled={
                                                    !selectedWilayah.regency_id ||
                                                    formData.is_ibu_terdaftar
                                                }
                                            >
                                                <option value="">Pilih</option>
                                                {districts.map((d) => (
                                                    <option
                                                        key={d.id}
                                                        value={d.id}
                                                    >
                                                        {d.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                Desa*
                                            </label>
                                            <select
                                                name="village_id"
                                                value={formData.village_id}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                                disabled={
                                                    !selectedWilayah.district_id ||
                                                    formData.is_ibu_terdaftar
                                                }
                                            >
                                                <option value="">Pilih</option>
                                                {villages.map((v) => (
                                                    <option
                                                        key={v.id}
                                                        value={v.id}
                                                    >
                                                        {v.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm">
                                            Posyandu Pembina*
                                        </label>
                                        <select
                                            name="posyandu_id"
                                            value={formData.posyandu_id}
                                            onChange={handleInputChange}
                                            className="mt-1 w-full rounded"
                                            required
                                            disabled={
                                                filteredPosyandus.length ===
                                                    0 ||
                                                formData.is_ibu_terdaftar
                                            }
                                        >
                                            <option value="">Pilih</option>
                                            {filteredPosyandus.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm">
                                            Alamat Lengkap Anak*
                                        </label>
                                        <textarea
                                            name="alamat_lengkap"
                                            value={formData.alamat_lengkap}
                                            onChange={handleInputChange}
                                            className="mt-1 w-full rounded"
                                            rows="2"
                                            required
                                            disabled={formData.is_ibu_terdaftar}
                                        ></textarea>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="block text-sm">
                                                RT*
                                            </label>
                                            <input
                                                type="text"
                                                name="rt"
                                                value={formData.rt}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                                required
                                                disabled={
                                                    formData.is_ibu_terdaftar
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                RW*
                                            </label>
                                            <input
                                                type="text"
                                                name="rw"
                                                value={formData.rw}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                                required
                                                disabled={
                                                    formData.is_ibu_terdaftar
                                                }
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

                            {step === 2 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                        2. Pemeriksaan Awal
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm">
                                                Berat Badan Lahir (kg)*
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                name="bb_lahir"
                                                value={formData.bb_lahir}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                Panjang Badan Lahir (cm)*
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                name="pb_lahir"
                                                value={formData.pb_lahir}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                Punya Buku KIA?*
                                            </label>
                                            <select
                                                name="punya_buku_kia"
                                                value={formData.punya_buku_kia}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                            >
                                                <option value={true}>Ya</option>
                                                <option value={false}>
                                                    Tidak
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                IMD?*
                                            </label>
                                            <select
                                                name="is_imd"
                                                value={formData.is_imd}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                            >
                                                <option value={true}>Ya</option>
                                                <option value={false}>
                                                    Tidak
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {step === 3 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                        3. Data Orang Tua
                                    </h3>
                                    {formData.is_ibu_terdaftar ? (
                                        <div className="p-4 border rounded-lg bg-gray-50 mb-4">
                                            <h4 className="font-semibold mb-2 text-gray-700">
                                                Data Orang Tua Terpilih
                                            </h4>
                                            <p>
                                                <strong>Nama:</strong>{" "}
                                                {selectedIbuData?.nama_lengkap ||
                                                    "..."}
                                            </p>
                                            <p>
                                                <strong>NIK:</strong>{" "}
                                                {selectedIbuData?.nik || "N/A"}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-4 border rounded-lg bg-gray-50 mb-4">
                                            <h4 className="font-semibold mb-2 text-gray-700">
                                                Input Data Orang Tua Baru
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm">
                                                        Nama Ibu/Wali*
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="nama_ibu_manual"
                                                        value={
                                                            formData.nama_ibu_manual
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="mt-1 w-full rounded"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm">
                                                        NIK Ibu/Wali
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="nik_ibu_manual"
                                                        value={
                                                            formData.nik_ibu_manual
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="mt-1 w-full rounded"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm">
                                                        Nomor WhatsApp*
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="nomor_hp_ibu_manual"
                                                        value={
                                                            formData.nomor_hp_ibu_manual
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="mt-1 w-full rounded"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            {step === 4 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                        4. Akun Login Orang Tua
                                    </h3>
                                    {formData.is_ibu_terdaftar ? (
                                        <p className="text-gray-600 italic">
                                            Akun login menggunakan akun Ibu yang
                                            sudah terdaftar.
                                        </p>
                                    ) : (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                Buat Akun Login untuk Ibu/Wali
                                                baru
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm">
                                                        Email*
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="mt-1 w-full rounded"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm">
                                                        Password*
                                                    </label>
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="mt-1 w-full rounded"
                                                        required
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm">
                                                        Konfirmasi Password*
                                                    </label>
                                                    <input
                                                        type="password"
                                                        name="password_confirmation"
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="mt-1 w-full rounded"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            <div className="flex justify-between gap-4 mt-6 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-300 rounded-lg"
                                >
                                    Batal
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(step - 1)}
                                        disabled={step === 1}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                                    >
                                        <ArrowLeft size={16} /> Kembali
                                    </button>
                                    {step < 4 ? (
                                        <button
                                            type="button"
                                            onClick={() => setStep(step + 1)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded"
                                        >
                                            Selanjutnya <ArrowRight size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                                        >
                                            Simpan
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
