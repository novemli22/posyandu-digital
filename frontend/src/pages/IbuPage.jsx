import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { PosyanduContext } from "../contexts/PosyanduContext";

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

    const posyandus = useContext(PosyanduContext);
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
        if (name === "is_nik_exists") {
            setFormData((prev) => ({
                ...prev,
                [name]: finalValue,
                nik: "",
                nomor_kk: "",
            }));
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

    const openEditModal = (ibu) => {
        alert(
            "Fitur Edit untuk form lengkap Ibu akan kita sempurnakan di langkah berikutnya."
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const finalFormData = { ...formData, hpl: hpl };

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
                    <Plus size={20} /> Tambah Ibu
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
                                (Langkah {step} dari 4)
                            </h2>
                            {error && (
                                <p className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                                    {error}
                                </p>
                            )}

                            {step === 1 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                        1. Data Diri & Kehamilan Awal
                                    </h3>
                                    <div className="mb-4 flex items-center">
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
                                            Memiliki NIK & KK
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                                Nomor KK*
                                            </label>
                                            <input
                                                type="text"
                                                name="nomor_kk"
                                                value={formData.nomor_kk}
                                                onChange={handleInputChange}
                                                disabled={
                                                    !formData.is_nik_exists
                                                }
                                                className="mt-1 w-full rounded disabled:bg-gray-200"
                                                required={
                                                    formData.is_nik_exists
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                NIK*
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
                                                required={
                                                    formData.is_nik_exists
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                Kehamilan Ke-*
                                            </label>
                                            <input
                                                type="number"
                                                name="kehamilan_ke"
                                                value={formData.kehamilan_ke}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                Jarak Kehamilan (Bulan)
                                            </label>
                                            <input
                                                type="number"
                                                name="jarak_kehamilan_bulan"
                                                value={
                                                    formData.jarak_kehamilan_bulan
                                                }
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
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
                                                value={formData.bb_awal}
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
                                                value={formData.tb_awal}
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
                                                value={formData.hpht}
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
                                    </div>
                                </section>
                            )}

                            {step === 2 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                        2. Riwayat & Kondisi Kesehatan
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm">
                                                Gol. Darah
                                            </label>
                                            <select
                                                name="golongan_darah"
                                                value={formData.golongan_darah}
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
                                        <div>
                                            <label className="block text-sm">
                                                Kontrasepsi Sebelumnya
                                            </label>
                                            <input
                                                type="text"
                                                name="kontrasepsi_sebelumnya"
                                                value={
                                                    formData.kontrasepsi_sebelumnya
                                                }
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-sm">
                                                Riwayat Penyakit
                                            </label>
                                            <input
                                                type="text"
                                                name="riwayat_penyakit"
                                                value={
                                                    formData.riwayat_penyakit
                                                }
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-sm">
                                                Riwayat Alergi
                                            </label>
                                            <input
                                                type="text"
                                                name="riwayat_alergi"
                                                value={formData.riwayat_alergi}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                            />
                                        </div>
                                        <div className="flex items-center pt-5">
                                            <input
                                                type="checkbox"
                                                id="buku_kia"
                                                name="punya_buku_kia"
                                                checked={
                                                    formData.punya_buku_kia
                                                }
                                                onChange={handleInputChange}
                                                className="mr-2 h-4 w-4"
                                            />
                                            <label
                                                htmlFor="buku_kia"
                                                className="text-sm"
                                            >
                                                Punya Buku KIA
                                            </label>
                                        </div>
                                        <div className="flex items-center pt-5">
                                            <input
                                                type="checkbox"
                                                id="ktd"
                                                name="is_ktd"
                                                checked={formData.is_ktd}
                                                onChange={handleInputChange}
                                                className="mr-2 h-4 w-4"
                                            />
                                            <label
                                                htmlFor="ktd"
                                                className="text-sm"
                                            >
                                                Kehamilan Tidak Diinginkan
                                            </label>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {step === 3 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                        3. Data Suami & Alamat
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm">
                                                Nama Suami*
                                            </label>
                                            <input
                                                type="text"
                                                name="nama_suami"
                                                value={formData.nama_suami}
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
                                                value={formData.nik_suami}
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
                                                value={formData.nomor_hp_suami}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
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
                                            >
                                                <option value="">
                                                    Pilih Provinsi
                                                </option>
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
                                                Kabupaten/Kota*
                                            </label>
                                            <select
                                                name="regency_id"
                                                value={
                                                    selectedWilayah.regency_id
                                                }
                                                onChange={handleWilayahChange}
                                                className="mt-1 w-full rounded"
                                                disabled={
                                                    !selectedWilayah.province_id
                                                }
                                            >
                                                <option value="">
                                                    Pilih Kabupaten/Kota
                                                </option>
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
                                                    !selectedWilayah.regency_id
                                                }
                                            >
                                                <option value="">
                                                    Pilih Kecamatan
                                                </option>
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
                                                Desa/Kelurahan*
                                            </label>
                                            <select
                                                name="village_id"
                                                value={formData.village_id}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                                disabled={
                                                    !selectedWilayah.district_id
                                                }
                                            >
                                                <option value="">
                                                    Pilih Desa/Kelurahan
                                                </option>
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
                                        >
                                            <option value="">
                                                Pilih Posyandu
                                            </option>
                                            {posyandus.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm">
                                            Alamat Lengkap (Jalan/Dusun)*
                                        </label>
                                        <textarea
                                            name="alamat_lengkap"
                                            value={formData.alamat_lengkap}
                                            onChange={handleInputChange}
                                            className="mt-1 w-full rounded"
                                            rows="2"
                                            required
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
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

                            {step === 4 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                        4. Data Administrasi & Akun
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm">
                                                Jaminan Kesehatan
                                            </label>
                                            <select
                                                name="jaminan_kesehatan"
                                                value={
                                                    formData.jaminan_kesehatan
                                                }
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
                                                value={
                                                    formData.nomor_jaminan_kesehatan
                                                }
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
                                                value={
                                                    formData.no_registrasi_kohort
                                                }
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
                                                value={formData.faskes_tk1}
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
                                                value={formData.faskes_rujukan}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                            />
                                        </div>
                                    </div>
                                    <hr className="my-6" />
                                    <p className="text-sm text-gray-600 mb-2">
                                        Informasi Akun (untuk login Ibu)
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder={
                                                    editingIbu
                                                        ? "(Kosongkan jika tidak diubah)"
                                                        : ""
                                                }
                                                className="mt-1 w-full rounded"
                                                required={!editingIbu}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                Konfirmasi Password
                                            </label>
                                            <input
                                                type="password"
                                                name="password_confirmation"
                                                value={
                                                    formData.password_confirmation
                                                }
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                                required={
                                                    !editingIbu &&
                                                    !!formData.password
                                                }
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

                            <div className="flex justify-between gap-4 mt-8 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    disabled={step === 1}
                                    className="flex items-center gap-2 px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                                >
                                    <ArrowLeft size={16} /> Kembali
                                </button>
                                {step < 4 ? (
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
                                        Simpan
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
