import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PosyanduContext } from "../contexts/PosyanduContext";

// State awal yang SANGAT LENGKAP sesuai form puskesmas
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
    const [puskesmasPembina, setPuskesmasPembina] = useState("");
    const [filteredPosyandus, setFilteredPosyandus] = useState([]);

    const { posyandus: allPosyandus } = useContext(PosyanduContext);
    const token = localStorage.getItem("auth_token");
    const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

    const fieldRefs = {
        nama_lengkap: useRef(null),
        nik: useRef(null),
        nomor_kk: useRef(null),
        tanggal_lahir: useRef(null),
        kehamilan_ke: useRef(null),
        hpht: useRef(null),
        bb_awal: useRef(null),
        tb_awal: useRef(null),
        nama_suami: useRef(null),
        nomor_hp_suami: useRef(null),
        village_id: useRef(null),
        posyandu_id: useRef(null),
        alamat_lengkap: useRef(null),
        email: useRef(null),
        password: useRef(null),
    };

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

    useEffect(() => {
        if (selectedWilayah.district_id) {
            const selectedDistrict = districts.find(
                (d) => d.id === selectedWilayah.district_id
            );
            if (selectedDistrict)
                setPuskesmasPembina(`Puskesmas ${selectedDistrict.name}`);
        } else {
            setPuskesmasPembina("");
        }
    }, [selectedWilayah.district_id, districts]);

    useEffect(() => {
        if (formData.village_id && allPosyandus) {
            const relevantPosyandus = allPosyandus.filter(
                (p) => p.village_id === formData.village_id
            );
            setFilteredPosyandus(relevantPosyandus);
        } else {
            setFilteredPosyandus([]);
        }
        if (!editingIbu) {
            setFormData((prev) => ({ ...prev, posyandu_id: "" }));
        }
    }, [formData.village_id, allPosyandus, editingIbu]);

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
        setFormData((prev) => ({ ...prev, village_id: "", posyandu_id: "" }));
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

    const openEditModal = async (ibu) => {
        setEditingIbu(ibu);
        setFormData({
            ...initialFormState,
            ...ibu,
            email: ibu.user.email,
            password: "",
            password_confirmation: "",
        });
        setError("");
        setStep(1);
        setIsModalOpen(true);

        if (ibu.posyandu?.village?.district?.regency?.province) {
            const provId = ibu.posyandu.village.district.regency.province.id;
            const regId = ibu.posyandu.village.district.regency.id;
            const distId = ibu.posyandu.village.district.id;

            setSelectedWilayah({
                province_id: provId,
                regency_id: regId,
                district_id: distId,
            });

            const regenciesRes = await axios.get(
                `http://localhost:8000/api/wilayah/regencies?province_id=${provId}`,
                API_CONFIG
            );
            setRegencies(regenciesRes.data);

            const districtsRes = await axios.get(
                `http://localhost:8000/api/wilayah/districts?regency_id=${regId}`,
                API_CONFIG
            );
            setDistricts(districtsRes.data);

            const villagesRes = await axios.get(
                `http://localhost:8000/api/wilayah/villages?district_id=${distId}`,
                API_CONFIG
            );
            setVillages(villagesRes.data);
        }
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
            fetchIbus();
            setIsModalOpen(false);
        } catch (err) {
            if (err.response && err.response.status === 422) {
                const errors = err.response.data.errors;
                const firstErrorField = Object.keys(errors)[0];
                const firstErrorMessage = errors[firstErrorField][0];
                alert(`Input Gagal: ${firstErrorMessage}`);
                const stepMap = {
                    nama_lengkap: 1,
                    nik: 1,
                    nomor_kk: 1,
                    tanggal_lahir: 1,
                    kehamilan_ke: 2,
                    hpht: 2,
                    bb_awal: 2,
                    tb_awal: 2,
                    nama_suami: 4,
                    nomor_hp_suami: 4,
                    village_id: 1,
                    posyandu_id: 1,
                    alamat_lengkap: 1,
                    rt: 1,
                    rw: 1,
                    email: 6,
                    password: 6,
                };
                const errorStep = stepMap[firstErrorField] || step;
                setStep(errorStep);
                setTimeout(() => {
                    fieldRefs[firstErrorField]?.current?.focus();
                }, 100);
            } else {
                alert("Terjadi kesalahan pada server. Coba lagi nanti.");
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
                                        <Link
                                            to={`/admin/ibu/${ibu.id}`}
                                            className="text-indigo-600 hover:underline font-semibold"
                                        >
                                            {ibu.nama_lengkap}
                                        </Link>
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

                            {step === 1 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                        1. Data Pribadi & Alamat
                                    </h3>
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
                                        <div className="flex items-center pt-5 col-span-full">
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
                                                Pendidikan
                                            </label>
                                            <select
                                                name="pendidikan"
                                                value={formData.pendidikan}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                            >
                                                <option>TIDAK SEKOLAH</option>
                                                <option>SD</option>
                                                <option>SMP</option>
                                                <option>SMA</option>
                                                <option>DIPLOMA</option>
                                                <option>S1</option>
                                                <option>S2/S3</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                Pekerjaan
                                            </label>
                                            <input
                                                type="text"
                                                name="pekerjaan"
                                                value={formData.pekerjaan}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
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
                                                required
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
                                                required
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
                                                required
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

                            {step === 2 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                        2. Data Kehamilan
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm">
                                                Kehamilan Ke-*
                                            </label>
                                            <input
                                                type="text"
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
                                                type="text"
                                                name="jarak_kehamilan_bulan"
                                                value={
                                                    formData.jarak_kehamilan_bulan
                                                }
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                                disabled={
                                                    formData.kehamilan_ke <= 1
                                                }
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
                                    </div>
                                </section>
                            )}

                            {step === 3 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                        3. Riwayat Kesehatan & Kebiasaan
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                Penggunaan Kontrasepsi
                                                Sebelumnya
                                            </label>
                                            <select
                                                name="kontrasepsi_sebelumnya"
                                                value={
                                                    formData.kontrasepsi_sebelumnya
                                                }
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                            >
                                                <option value="Tidak Pakai">
                                                    Tidak Pakai
                                                </option>
                                                <option value="Suntik 1 Bulan">
                                                    Suntik 1 Bulan
                                                </option>
                                                <option value="Suntik 3 Bulan">
                                                    Suntik 3 Bulan
                                                </option>
                                                <option value="Pil">Pil</option>
                                                <option value="IUD">IUD</option>
                                                <option value="Implan">
                                                    Implan
                                                </option>
                                                <option value="Kondom">
                                                    Kondom
                                                </option>
                                                <option value="Lainnya">
                                                    Lainnya
                                                </option>
                                            </select>
                                        </div>
                                        {formData.kontrasepsi_sebelumnya ===
                                            "Lainnya" && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm">
                                                    Sebutkan Metode Lainnya
                                                </label>
                                                <input
                                                    type="text"
                                                    name="kontrasepsi_lainnya"
                                                    value={
                                                        formData.kontrasepsi_lainnya
                                                    }
                                                    onChange={handleInputChange}
                                                    className="mt-1 w-full rounded"
                                                />
                                            </div>
                                        )}
                                        <div className="md:col-span-2">
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
                                        <div className="md:col-span-2">
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

                            {step === 4 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                        4. Data Suami
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
                                </section>
                            )}

                            {step === 5 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                        5. Faskes & Penempatan
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        <div className="md:col-span-2">
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
                                                    0
                                                }
                                            >
                                                <option value="">
                                                    Pilih Posyandu
                                                </option>
                                                {filteredPosyandus.map((p) => (
                                                    <option
                                                        key={p.id}
                                                        value={p.id}
                                                    >
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {step === 6 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                        6. Data Administrasi & Akun
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
                                        <div className="md:col-span-3">
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
                                                ref={fieldRefs.email}
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
                                                ref={fieldRefs.password}
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
