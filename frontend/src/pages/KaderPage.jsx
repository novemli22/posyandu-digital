import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Plus, Edit, Trash2 } from "lucide-react";
import { PosyanduContext } from "../contexts/PosyanduContext";

const initialFormState = {
    nama_lengkap: "",
    email: "",
    password: "",
    password_confirmation: "",
    posyandu_id: "",
    nik: "",
    tanggal_lahir: "",
    jenis_kelamin: "PEREMPUAN",
    nomor_hp: "",
    memiliki_jkn: false,
    ktp_village_id: "",
    ktp_address: "",
    ktp_rt: "",
    ktp_rw: "",
    domisili_sesuai_ktp: true,
    domisili_village_id: "",
    domisili_address: "",
    domisili_rt: "",
    domisili_rw: "",
    pelatihan_posyandu: false,
    pelatihan_ibu_hamil: false,
    pelatihan_balita: false,
    tkk_posyandu: 0,
    tkk_ibu_hamil: 0,
    tkk_balita: 0,
};

const initialWilayahState = {
    ktp_prov: "",
    ktp_reg: "",
    ktp_dist: "",
    dom_prov: "",
    dom_reg: "",
    dom_dist: "",
};

export default function KaderPage() {
    const [kaders, setKaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [error, setError] = useState("");
    const [editingKader, setEditingKader] = useState(null);

    const [provinces, setProvinces] = useState([]);
    const [ktpRegencies, setKtpRegencies] = useState([]);
    const [ktpDistricts, setKtpDistricts] = useState([]);
    const [ktpVillages, setKtpVillages] = useState([]);
    const [domisiliRegencies, setDomisiliRegencies] = useState([]);
    const [domisiliDistricts, setDomisiliDistricts] = useState([]);
    const [domisiliVillages, setDomisiliVillages] = useState([]);
    const [selectedWilayah, setSelectedWilayah] = useState(initialWilayahState);

    const posyandus = useContext(PosyanduContext);
    const token = localStorage.getItem("auth_token");
    const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [kaderRes, provinceRes] = await Promise.all([
                axios.get("http://localhost:8000/api/kaders", API_CONFIG),
                axios.get(
                    "http://localhost:8000/api/wilayah/provinces",
                    API_CONFIG
                ),
            ]);
            setKaders(kaderRes.data);
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
        if (selectedWilayah.ktp_prov) {
            axios
                .get(
                    `http://localhost:8000/api/wilayah/regencies?province_id=${selectedWilayah.ktp_prov}`,
                    API_CONFIG
                )
                .then((res) => setKtpRegencies(res.data));
        }
    }, [selectedWilayah.ktp_prov]);
    useEffect(() => {
        if (selectedWilayah.ktp_reg) {
            axios
                .get(
                    `http://localhost:8000/api/wilayah/districts?regency_id=${selectedWilayah.ktp_reg}`,
                    API_CONFIG
                )
                .then((res) => setKtpDistricts(res.data));
        }
    }, [selectedWilayah.ktp_reg]);
    useEffect(() => {
        if (selectedWilayah.ktp_dist) {
            axios
                .get(
                    `http://localhost:8000/api/wilayah/villages?district_id=${selectedWilayah.ktp_dist}`,
                    API_CONFIG
                )
                .then((res) => setKtpVillages(res.data));
        }
    }, [selectedWilayah.ktp_dist]);
    useEffect(() => {
        if (selectedWilayah.dom_prov) {
            axios
                .get(
                    `http://localhost:8000/api/wilayah/regencies?province_id=${selectedWilayah.dom_prov}`,
                    API_CONFIG
                )
                .then((res) => setDomisiliRegencies(res.data));
        }
    }, [selectedWilayah.dom_prov]);
    useEffect(() => {
        if (selectedWilayah.dom_reg) {
            axios
                .get(
                    `http://localhost:8000/api/wilayah/districts?regency_id=${selectedWilayah.dom_reg}`,
                    API_CONFIG
                )
                .then((res) => setDomisiliDistricts(res.data));
        }
    }, [selectedWilayah.dom_reg]);
    useEffect(() => {
        if (selectedWilayah.dom_dist) {
            axios
                .get(
                    `http://localhost:8000/api/wilayah/villages?district_id=${selectedWilayah.dom_dist}`,
                    API_CONFIG
                )
                .then((res) => setDomisiliVillages(res.data));
        }
    }, [selectedWilayah.dom_dist]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const numericFields = [
            "nik",
            "nomor_hp",
            "ktp_rt",
            "ktp_rw",
            "domisili_rt",
            "domisili_rw",
            "tkk_posyandu",
            "tkk_ibu_hamil",
            "tkk_balita",
        ];
        if (numericFields.includes(name)) {
            setFormData((prev) => ({
                ...prev,
                [name]: value.replace(/[^0-9]/g, ""),
            }));
        } else if (type === "checkbox") {
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleWilayahChange = (e, type) => {
        const { name, value } = e.target;
        const wilName =
            type === "ktp" ? "ktp_village_id" : "domisili_village_id";
        setSelectedWilayah((prev) => ({ ...prev, [name]: value }));
        if (name.endsWith("_prov")) {
            (type === "ktp" ? setKtpRegencies : setDomisiliRegencies)([]);
            (type === "ktp" ? setKtpDistricts : setDomisiliDistricts)([]);
            (type === "ktp" ? setKtpVillages : setDomisiliVillages)([]);
        }
        if (name.endsWith("_reg")) {
            (type === "ktp" ? setKtpDistricts : setDomisiliDistricts)([]);
            (type === "ktp" ? setKtpVillages : setDomisiliVillages)([]);
        }
        if (name.endsWith("_dist")) {
            (type === "ktp" ? setKtpVillages : setDomisiliVillages)([]);
        }
        setFormData((prev) => ({ ...prev, [wilName]: "" }));
    };

    const openTambahModal = () => {
        setEditingKader(null);
        setFormData(initialFormState);
        setSelectedWilayah(initialWilayahState);
        setKtpRegencies([]);
        setKtpDistricts([]);
        setKtpVillages([]);
        setDomisiliRegencies([]);
        setDomisiliDistricts([]);
        setDomisiliVillages([]);
        setError("");
        setIsModalOpen(true);
    };

    const openEditModal = (kader) => {
        setEditingKader(kader);
        setFormData({ ...initialFormState, ...kader });
        if (kader.ktp_village?.district?.regency?.province_id) {
            setSelectedWilayah((prev) => ({
                ...prev,
                ktp_prov: kader.ktp_village.district.regency.province_id,
            }));
        }
        setError("");
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        let finalFormData = { ...formData };
        if (formData.domisili_sesuai_ktp) {
            finalFormData = {
                ...finalFormData,
                domisili_village_id: formData.ktp_village_id,
                domisili_address: formData.ktp_address,
                domisili_rt: formData.ktp_rt,
                domisili_rw: formData.ktp_rw,
            };
        }
        const url = editingKader
            ? `http://localhost:8000/api/kaders/${editingKader.id}`
            : "http://localhost:8000/api/kaders";
        const method = editingKader ? "put" : "post";
        try {
            const response = await axios[method](
                url,
                finalFormData,
                API_CONFIG
            );
            if (editingKader) {
                setKaders(
                    kaders.map((k) =>
                        k.id === editingKader.id ? response.data : k
                    )
                );
            } else {
                setKaders([response.data, ...kaders]);
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

    const handleDelete = async (kaderId) => {
        if (window.confirm("Yakin ingin menghapus data kader ini?")) {
            try {
                await axios.delete(
                    `http://localhost:8000/api/kaders/${kaderId}`,
                    API_CONFIG
                );
                setKaders(kaders.filter((k) => k.id !== kaderId));
            } catch (error) {
                alert("Gagal menghapus data kader.");
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manajemen Kader</h1>
                <button
                    onClick={openTambahModal}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
                >
                    <Plus size={20} /> Tambah Kader
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
                                    Nama Kader
                                </th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">
                                    Kontak
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
                            {kaders.map((kader) => (
                                <tr key={kader.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-4 border-b text-sm">
                                        <p>{kader.nama_lengkap}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <p>{kader.nomor_hp}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <p>{kader.posyandu?.name || "N/A"}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    openEditModal(kader)
                                                }
                                                className="text-yellow-600 hover:text-yellow-900"
                                            >
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 md:p-8 rounded-lg w-full max-w-4xl shadow-xl">
                        <form
                            onSubmit={handleSubmit}
                            className="max-h-[85vh] overflow-y-auto pr-4"
                        >
                            <h2 className="text-2xl font-bold mb-6 sticky top-0 bg-white py-2 z-10">
                                {editingKader
                                    ? "Edit Kader"
                                    : "Tambah Kader Baru"}
                            </h2>
                            {error && (
                                <p className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                                    {error}
                                </p>
                            )}

                            <section id="identitas-pribadi">
                                <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                    Identitas & Akun
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                            NIK*
                                        </label>
                                        <input
                                            type="text"
                                            name="nik"
                                            value={formData.nik}
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
                                            <option value="PEREMPUAN">
                                                Perempuan
                                            </option>
                                            <option value="LAKI-LAKI">
                                                Laki-laki
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm">
                                            No. Whatsapp*
                                        </label>
                                        <input
                                            type="text"
                                            name="nomor_hp"
                                            value={formData.nomor_hp}
                                            onChange={handleInputChange}
                                            className="mt-1 w-full rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm">
                                            Email*
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
                                            Tempat Penugasan*
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
                                    <div className="flex items-center pt-5">
                                        <input
                                            type="checkbox"
                                            id="jkn"
                                            name="memiliki_jkn"
                                            checked={formData.memiliki_jkn}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 mr-2"
                                        />
                                        <label
                                            htmlFor="jkn"
                                            className="text-sm"
                                        >
                                            Memiliki JKN/KIS
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm">
                                            Password*
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            onChange={handleInputChange}
                                            placeholder={
                                                editingKader
                                                    ? "(Kosongkan jika tidak diubah)"
                                                    : "Wajib diisi"
                                            }
                                            className="mt-1 w-full rounded"
                                            required={!editingKader}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm">
                                            Konfirmasi Password*
                                        </label>
                                        <input
                                            type="password"
                                            name="password_confirmation"
                                            onChange={handleInputChange}
                                            className="mt-1 w-full rounded"
                                            required={
                                                !editingKader &&
                                                formData.password
                                            }
                                        />
                                    </div>
                                </div>
                            </section>

                            <section id="alamat-ktp" className="mt-6">
                                <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                    Alamat Sesuai KTP
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm">
                                            Provinsi*
                                        </label>
                                        <select
                                            name="ktp_prov"
                                            value={selectedWilayah.ktp_prov}
                                            onChange={(e) =>
                                                handleWilayahChange(e, "ktp")
                                            }
                                            className="mt-1 w-full rounded"
                                        >
                                            <option value="">Pilih</option>
                                            {provinces.map((p) => (
                                                <option key={p.id} value={p.id}>
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
                                            name="ktp_reg"
                                            value={selectedWilayah.ktp_reg}
                                            onChange={(e) =>
                                                handleWilayahChange(e, "ktp")
                                            }
                                            className="mt-1 w-full rounded"
                                            disabled={!selectedWilayah.ktp_prov}
                                        >
                                            <option value="">Pilih</option>
                                            {ktpRegencies.map((r) => (
                                                <option key={r.id} value={r.id}>
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
                                            name="ktp_dist"
                                            value={selectedWilayah.ktp_dist}
                                            onChange={(e) =>
                                                handleWilayahChange(e, "ktp")
                                            }
                                            className="mt-1 w-full rounded"
                                            disabled={!selectedWilayah.ktp_reg}
                                        >
                                            <option value="">Pilih</option>
                                            {ktpDistricts.map((d) => (
                                                <option key={d.id} value={d.id}>
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
                                            name="ktp_village_id"
                                            value={formData.ktp_village_id}
                                            onChange={handleInputChange}
                                            className="mt-1 w-full rounded"
                                            disabled={!selectedWilayah.ktp_dist}
                                        >
                                            <option value="">Pilih</option>
                                            {ktpVillages.map((v) => (
                                                <option key={v.id} value={v.id}>
                                                    {v.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm">
                                        Alamat Lengkap*
                                    </label>
                                    <textarea
                                        name="ktp_address"
                                        value={formData.ktp_address}
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
                                            name="ktp_rt"
                                            value={formData.ktp_rt}
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
                                            name="ktp_rw"
                                            value={formData.ktp_rw}
                                            onChange={handleInputChange}
                                            className="mt-1 w-full rounded"
                                            required
                                        />
                                    </div>
                                </div>
                            </section>

                            <section id="alamat-domisili" className="mt-6">
                                <div className="flex items-center border-b pb-2 mb-4">
                                    <input
                                        type="checkbox"
                                        id="domisili_sama"
                                        name="domisili_sesuai_ktp"
                                        checked={formData.domisili_sesuai_ktp}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 mr-2"
                                    />
                                    <label
                                        htmlFor="domisili_sama"
                                        className="text-lg font-semibold text-indigo-700"
                                    >
                                        Alamat Domisili Sesuai KTP
                                    </label>
                                </div>
                                {!formData.domisili_sesuai_ktp && (
                                    <div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm">
                                                    Provinsi*
                                                </label>
                                                <select
                                                    name="dom_prov"
                                                    value={
                                                        selectedWilayah.dom_prov
                                                    }
                                                    onChange={(e) =>
                                                        handleWilayahChange(
                                                            e,
                                                            "domisili"
                                                        )
                                                    }
                                                    className="mt-1 w-full rounded"
                                                >
                                                    <option value="">
                                                        Pilih
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
                                                    name="dom_reg"
                                                    value={
                                                        selectedWilayah.dom_reg
                                                    }
                                                    onChange={(e) =>
                                                        handleWilayahChange(
                                                            e,
                                                            "domisili"
                                                        )
                                                    }
                                                    className="mt-1 w-full rounded"
                                                    disabled={
                                                        !selectedWilayah.dom_prov
                                                    }
                                                >
                                                    <option value="">
                                                        Pilih
                                                    </option>
                                                    {domisiliRegencies.map(
                                                        (r) => (
                                                            <option
                                                                key={r.id}
                                                                value={r.id}
                                                            >
                                                                {r.name}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm">
                                                    Kecamatan*
                                                </label>
                                                <select
                                                    name="dom_dist"
                                                    value={
                                                        selectedWilayah.dom_dist
                                                    }
                                                    onChange={(e) =>
                                                        handleWilayahChange(
                                                            e,
                                                            "domisili"
                                                        )
                                                    }
                                                    className="mt-1 w-full rounded"
                                                    disabled={
                                                        !selectedWilayah.dom_reg
                                                    }
                                                >
                                                    <option value="">
                                                        Pilih
                                                    </option>
                                                    {domisiliDistricts.map(
                                                        (d) => (
                                                            <option
                                                                key={d.id}
                                                                value={d.id}
                                                            >
                                                                {d.name}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm">
                                                    Desa/Kelurahan*
                                                </label>
                                                <select
                                                    name="domisili_village_id"
                                                    value={
                                                        formData.domisili_village_id
                                                    }
                                                    onChange={handleInputChange}
                                                    className="mt-1 w-full rounded"
                                                    disabled={
                                                        !selectedWilayah.dom_dist
                                                    }
                                                >
                                                    <option value="">
                                                        Pilih
                                                    </option>
                                                    {domisiliVillages.map(
                                                        (v) => (
                                                            <option
                                                                key={v.id}
                                                                value={v.id}
                                                            >
                                                                {v.name}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-sm">
                                                Alamat Lengkap*
                                            </label>
                                            <textarea
                                                name="domisili_address"
                                                value={
                                                    formData.domisili_address
                                                }
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                                rows="2"
                                            ></textarea>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <label className="block text-sm">
                                                    RT*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="domisili_rt"
                                                    value={formData.domisili_rt}
                                                    onChange={handleInputChange}
                                                    className="mt-1 w-full rounded"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm">
                                                    RW*
                                                </label>
                                                <input
                                                    type="text"
                                                    name="domisili_rw"
                                                    value={formData.domisili_rw}
                                                    onChange={handleInputChange}
                                                    className="mt-1 w-full rounded"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>

                            <section id="kompetensi" className="mt-6">
                                <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">
                                    Kompetensi Kader
                                </h3>
                                <div className="mb-2">
                                    <p className="text-sm font-medium">
                                        Riwayat Pelatihan:
                                    </p>
                                    <div className="flex items-center gap-6 mt-2 flex-wrap">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="p_posyandu"
                                                name="pelatihan_posyandu"
                                                checked={
                                                    formData.pelatihan_posyandu
                                                }
                                                onChange={handleInputChange}
                                                className="h-4 w-4 mr-2"
                                            />
                                            <label
                                                htmlFor="p_posyandu"
                                                className="text-sm"
                                            >
                                                Pengelolaan Posyandu
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="p_ibu"
                                                name="pelatihan_ibu_hamil"
                                                checked={
                                                    formData.pelatihan_ibu_hamil
                                                }
                                                onChange={handleInputChange}
                                                className="h-4 w-4 mr-2"
                                            />
                                            <label
                                                htmlFor="p_ibu"
                                                className="text-sm"
                                            >
                                                Kesehatan Ibu Hamil/Nifas
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="p_balita"
                                                name="pelatihan_balita"
                                                checked={
                                                    formData.pelatihan_balita
                                                }
                                                onChange={handleInputChange}
                                                className="h-4 w-4 mr-2"
                                            />
                                            <label
                                                htmlFor="p_balita"
                                                className="text-sm"
                                            >
                                                Kesehatan Balita
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm font-medium">
                                        Jumlah Tanda Kecakapan Kader (TKK):
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                        <div>
                                            <label className="block text-sm">
                                                TKK Posyandu
                                            </label>
                                            <input
                                                type="number"
                                                name="tkk_posyandu"
                                                value={formData.tkk_posyandu}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                TKK Ibu Hamil/Nifas
                                            </label>
                                            <input
                                                type="number"
                                                name="tkk_ibu_hamil"
                                                value={formData.tkk_ibu_hamil}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm">
                                                TKK Balita
                                            </label>
                                            <input
                                                type="number"
                                                name="tkk_balita"
                                                value={formData.tkk_balita}
                                                onChange={handleInputChange}
                                                className="mt-1 w-full rounded"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

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
