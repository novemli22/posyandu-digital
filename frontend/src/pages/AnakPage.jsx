import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2 } from "lucide-react";

// State awal yang bersih untuk form Anak
const initialFormState = {
    is_ibu_terdaftar: true,
    ibu_id: "",
    nama_ibu_manual: "",
    nik_ibu_manual: "",
    posyandu_id: "",
    alamat_lengkap_manual: "",
    rt_manual: "",
    rw_manual: "",
    nama_lengkap: "",
    is_nik_exists: true,
    nik: "",
    nomor_kk: "",
    anak_ke: 1,
    tanggal_lahir: "",
    jenis_kelamin: "LAKI-LAKI",
    bb_lahir: "",
    pb_lahir: "",
    punya_buku_kia: true,
    is_imd: false,
};

const initialWilayahState = {
    province_id: "",
    regency_id: "",
    district_id: "",
    village_id: "",
};

export default function AnakPage() {
    const [anaks, setAnaks] = useState([]);
    const [ibus, setIbus] = useState([]);
    const [allPosyandus, setAllPosyandus] = useState([]); // Menyimpan SEMUA posyandu
    const [filteredPosyandus, setFilteredPosyandus] = useState([]); // Menyimpan posyandu yang sudah difilter
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [error, setError] = useState("");
    const [editingAnak, setEditingAnak] = useState(null);

    // State untuk dropdown wilayah (hanya untuk mode manual)
    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);
    const [selectedWilayah, setSelectedWilayah] = useState(initialWilayahState);

    const token = localStorage.getItem("auth_token");
    const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

    // --- FUNGSI FETCH DATA ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [anakRes, ibuRes, posyanduRes, provinceRes] =
                await Promise.all([
                    axios.get("http://localhost:8000/api/anaks", API_CONFIG),
                    axios.get("http://localhost:8000/api/ibus", API_CONFIG),
                    axios.get(
                        "http://localhost:8000/api/posyandus",
                        API_CONFIG
                    ),
                    axios.get(
                        "http://localhost:8000/api/wilayah/provinces",
                        API_CONFIG
                    ),
                ]);
            setAnaks(anakRes.data);
            setIbus(ibuRes.data);
            setAllPosyandus(posyanduRes.data); // Simpan semua posyandu di sini
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

    // --- LOGIKA CASCADING DROPDOWN (UNTUK MODE MANUAL) ---
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

    // --- LOGIKA ISI OTOMATIS & FILTER POSYANDU ---
    useEffect(() => {
        let villageIdToFilter = null;
        // Skenario 1: Ibu terdaftar, gunakan village_id dari posyandu si Ibu
        if (formData.ibu_id && formData.is_ibu_terdaftar) {
            const selectedIbu = ibus.find(
                (i) => i.id === parseInt(formData.ibu_id)
            );
            if (selectedIbu) {
                setFormData((prev) => ({
                    ...prev,
                    nomor_kk: selectedIbu.nomor_kk || "",
                }));
                if (selectedIbu.posyandu) {
                    villageIdToFilter = selectedIbu.posyandu.village_id;
                }
            }
        }
        // Skenario 2: Ibu tidak terdaftar, gunakan village_id dari dropdown alamat manual
        else if (!formData.is_ibu_terdaftar && formData.village_id) {
            villageIdToFilter = formData.village_id;
        }

        // Lakukan filter jika ada village_id yang valid
        if (villageIdToFilter) {
            const relevantPosyandus = allPosyandus.filter(
                (p) => p.village_id === villageIdToFilter
            );
            setFilteredPosyandus(relevantPosyandus);
        } else {
            setFilteredPosyandus([]); // Kosongkan jika tidak ada desa terpilih
        }
        // Reset pilihan posyandu setiap kali desa berubah
        setFormData((prev) => ({ ...prev, posyandu_id: "" }));
    }, [
        formData.ibu_id,
        formData.village_id,
        formData.is_ibu_terdaftar,
        ibus,
        allPosyandus,
    ]);

    // --- PERBAIKAN: Fungsi Input dengan Filter Angka ---
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
            "rt_manual",
            "rw_manual",
        ];

        if (name === "is_ibu_terdaftar" || name === "is_nik_exists") {
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
        setFormData((prev) => ({ ...prev, village_id: "" }));
    };

    const openTambahModal = () => {
        setEditingAnak(null);
        setFormData(initialFormState);
        setSelectedWilayah(initialWilayahState);
        setRegencies([]);
        setDistricts([]);
        setVillages([]);
        setError("");
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const url = editingAnak
            ? `http://localhost:8000/api/anaks/${editingAnak.id}`
            : "http://localhost:8000/api/anaks";
        const method = editingAnak ? "put" : "post";
        try {
            const response = await axios[method](url, formData, API_CONFIG);
            fetchData();
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
                                            <button className="text-yellow-600">
                                                <Edit size={18} />
                                            </button>
                                            <button className="text-red-600">
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
                            {editingAnak
                                ? "Edit Data Anak"
                                : "Tambah Anak Baru"}
                        </h2>
                        <form onSubmit={handleSubmit}>
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
                                    Ibu Sudah Terdaftar di Sistem
                                </label>
                            </div>

                            {formData.is_ibu_terdaftar ? (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium">
                                        Pilih Orang Tua (Ibu)*
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
                            ) : (
                                <section className="p-4 border rounded-lg bg-gray-50 mb-4">
                                    <h4 className="font-semibold mb-2 text-gray-700">
                                        Input Data Ibu Baru
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm">
                                                Nama Ibu*
                                            </label>
                                            <input
                                                type="text"
                                                name="nama_ibu_manual"
                                                value={formData.nama_ibu_manual}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                NIK Ibu
                                            </label>
                                            <input
                                                type="text"
                                                name="nik_ibu_manual"
                                                value={formData.nik_ibu_manual}
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
                                            Alamat Lengkap Ibu*
                                        </label>
                                        <textarea
                                            name="alamat_lengkap_manual"
                                            value={
                                                formData.alamat_lengkap_manual
                                            }
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
                                                name="rt_manual"
                                                value={formData.rt_manual}
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
                                                name="rw_manual"
                                                value={formData.rw_manual}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                                required
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium">
                                    Posyandu Pembina*
                                </label>
                                <select
                                    name="posyandu_id"
                                    value={formData.posyandu_id}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded"
                                    required
                                    disabled={filteredPosyandus.length === 0}
                                >
                                    <option value="">Pilih Posyandu</option>
                                    {filteredPosyandus.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <hr className="my-6" />
                            <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                Data Diri Anak
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm">
                                        Nama Anak*
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
                                        Anak Ke-*
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
                                <div>
                                    <label className="block text-sm">
                                        BB Lahir (kg)*
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
                                        PB Lahir (cm)*
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
                                        Memiliki NIK & KK
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
                                        disabled={!formData.is_nik_exists}
                                        className="mt-1 w-full rounded disabled:bg-gray-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm">
                                        Nomor KK
                                    </label>
                                    <input
                                        type="text"
                                        name="nomor_kk"
                                        value={formData.nomor_kk}
                                        onChange={handleInputChange}
                                        disabled={!formData.is_nik_exists}
                                        className="mt-1 w-full rounded disabled:bg-gray-200"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-6 mt-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="punya_buku_kia"
                                        name="punya_buku_kia"
                                        checked={formData.punya_buku_kia}
                                        onChange={handleInputChange}
                                        className="mr-2 h-4 w-4"
                                    />
                                    <label
                                        htmlFor="punya_buku_kia"
                                        className="text-sm"
                                    >
                                        Punya Buku KIA
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_imd"
                                        name="is_imd"
                                        checked={formData.is_imd}
                                        onChange={handleInputChange}
                                        className="mr-2 h-4 w-4"
                                    />
                                    <label htmlFor="is_imd" className="text-sm">
                                        Inisiasi Menyusu Dini (IMD)
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-300 rounded-lg"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
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
