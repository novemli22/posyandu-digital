import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
    ArrowLeft,
    User,
    MapPin,
    Award,
    ShieldCheck,
    Phone,
    Mail,
    Home,
    CheckCircle,
    XCircle,
} from "lucide-react";

export default function KaderDetailPage() {
    const { kaderId } = useParams(); // Mengambil ID dari URL
    const [kader, setKader] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("auth_token");
    const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/kaders/${kaderId}`,
                    API_CONFIG
                );
                setKader(response.data);
            } catch (err) {
                console.error("Gagal mengambil detail kader:", err);
                setError("Gagal memuat data. Pastikan data ada dan coba lagi.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [kaderId]); // Jalankan lagi jika ID di URL berubah

    // Komponen kecil untuk menampilkan item detail agar rapi
    const DetailItem = ({ label, value, className = "" }) => (
        <div className={className}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-md font-semibold text-gray-800">
                {value || "-"}
            </p>
        </div>
    );

    // Komponen untuk menampilkan status boolean (Ya/Tidak) dengan badge
    const StatusBadge = ({ label, value }) => (
        <div className="flex items-center gap-2">
            {value ? (
                <CheckCircle size={18} className="text-green-500" />
            ) : (
                <XCircle size={18} className="text-red-500" />
            )}
            <span className="text-md text-gray-700">{label}</span>
        </div>
    );

    if (loading)
        return (
            <div className="p-10 text-center">Memuat data detail kader...</div>
        );
    if (error)
        return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!kader)
        return (
            <div className="p-10 text-center">Data kader tidak ditemukan.</div>
        );

    return (
        <div>
            <Link
                to="/admin/kader"
                className="flex items-center gap-2 text-indigo-600 hover:underline mb-6 font-medium"
            >
                <ArrowLeft size={18} />
                Kembali ke Daftar Kader
            </Link>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                {/* Header Detail */}
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-6 pb-6 border-b">
                    <div className="bg-indigo-100 p-4 rounded-full">
                        <User className="h-10 w-10 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">
                            {kader.nama_lengkap}
                        </h1>
                        <p className="text-md text-gray-500">
                            NIK: {kader.nik}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail size={14} /> {kader.user?.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone size={14} /> {kader.nomor_hp}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Informasi Pribadi & Penugasan */}
                    <section>
                        <h3 className="font-bold text-xl text-gray-800 mb-3">
                            Informasi Pribadi & Penugasan
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                            <DetailItem
                                label="Tanggal Lahir"
                                value={kader.tanggal_lahir}
                            />
                            <DetailItem
                                label="Jenis Kelamin"
                                value={kader.jenis_kelamin}
                            />
                            <DetailItem
                                label="Posyandu Bertugas"
                                value={kader.posyandu?.name}
                            />
                            <DetailItem
                                label="Memiliki JKN/KIS"
                                value={kader.memiliki_jkn ? "Ya" : "Tidak"}
                            />
                        </div>
                    </section>

                    {/* Alamat KTP */}
                    <section>
                        <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                            <MapPin size={20} /> Alamat KTP
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                            <DetailItem
                                label="Alamat"
                                value={`${kader.ktp_address}, RT ${kader.ktp_rt}/RW ${kader.ktp_rw}`}
                                className="col-span-2 md:col-span-4"
                            />
                            <DetailItem
                                label="Desa/Kelurahan"
                                value={kader.ktp_village?.name}
                            />
                            <DetailItem
                                label="Kecamatan"
                                value={kader.ktp_village?.district?.name}
                            />
                            <DetailItem
                                label="Kabupaten/Kota"
                                value={
                                    kader.ktp_village?.district?.regency?.name
                                }
                            />
                            <DetailItem
                                label="Provinsi"
                                value={
                                    kader.ktp_village?.district?.regency
                                        ?.province?.name
                                }
                            />
                        </div>
                    </section>

                    {/* Alamat Domisili */}
                    <section>
                        <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                            <Home size={20} /> Alamat Domisili
                        </h3>
                        {kader.domisili_sesuai_ktp ? (
                            <p className="italic text-gray-600 bg-gray-50 p-4 rounded-lg">
                                Sesuai dengan alamat KTP.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                                <DetailItem
                                    label="Alamat"
                                    value={`${kader.domisili_address}, RT ${kader.domisili_rt}/RW ${kader.domisili_rw}`}
                                    className="col-span-2 md:col-span-4"
                                />
                                <DetailItem
                                    label="Desa/Kelurahan"
                                    value={kader.domisili_village?.name}
                                />
                                <DetailItem
                                    label="Kecamatan"
                                    value={
                                        kader.domisili_village?.district?.name
                                    }
                                />
                                <DetailItem
                                    label="Kabupaten/Kota"
                                    value={
                                        kader.domisili_village?.district
                                            ?.regency?.name
                                    }
                                />
                                <DetailItem
                                    label="Provinsi"
                                    value={
                                        kader.domisili_village?.district
                                            ?.regency?.province?.name
                                    }
                                />
                            </div>
                        )}
                    </section>

                    {/* Kompetensi */}
                    <section>
                        <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                            <Award size={20} /> Kompetensi
                        </h3>
                        <div className="p-4 border rounded-lg">
                            <p className="font-semibold mb-3">
                                Riwayat Pelatihan:
                            </p>
                            <div className="flex gap-4 flex-wrap">
                                <StatusBadge
                                    label="Pengelolaan Posyandu"
                                    value={kader.pelatihan_posyandu}
                                />
                                <StatusBadge
                                    label="Kesehatan Ibu Hamil/Nifas"
                                    value={kader.pelatihan_ibu_hamil}
                                />
                                <StatusBadge
                                    label="Kesehatan Balita"
                                    value={kader.pelatihan_balita}
                                />
                            </div>
                            <p className="font-semibold mt-4 mb-2">
                                Jumlah Tanda Kecakapan Kader (TKK):
                            </p>
                            <div className="flex gap-6 flex-wrap">
                                <DetailItem
                                    label="TKK Posyandu"
                                    value={kader.tkk_posyandu}
                                />
                                <DetailItem
                                    label="TKK Ibu Hamil"
                                    value={kader.tkk_ibu_hamil}
                                />
                                <DetailItem
                                    label="TKK Balita"
                                    value={kader.tkk_balita}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
