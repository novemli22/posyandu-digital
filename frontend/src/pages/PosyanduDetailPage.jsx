import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Home, Building2 } from "lucide-react";

export default function PosyanduDetailPage() {
    const { posyanduId } = useParams();
    const [posyandu, setPosyandu] = useState(null);
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
                    `http://localhost:8000/api/posyandus/${posyanduId}`,
                    API_CONFIG
                );
                setPosyandu(response.data);
            } catch (err) {
                console.error("Gagal mengambil detail posyandu:", err);
                setError("Gagal memuat data. Pastikan data ada dan coba lagi.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [posyanduId]);

    if (loading) {
        return (
            <div className="text-center p-10">
                Memuat data detail Posyandu...
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">{error}</div>;
    }

    if (!posyandu) {
        return (
            <div className="text-center p-10">
                Data Posyandu tidak ditemukan.
            </div>
        );
    }

    return (
        <div>
            <Link
                to="/admin/posyandu"
                className="flex items-center gap-2 text-indigo-600 hover:underline mb-6 font-medium"
            >
                <ArrowLeft size={18} />
                Kembali ke Daftar Posyandu
            </Link>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                {/* Header Detail */}
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-6 pb-6 border-b">
                    <div className="bg-indigo-100 p-4 rounded-xl">
                        <Home className="h-10 w-10 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">
                            {posyandu.name}
                        </h1>
                        <p className="text-md text-gray-500">
                            Detail Informasi Posyandu & Wilayah Kerja
                        </p>
                    </div>
                </div>

                {/* Konten Detail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Kolom Kiri: Informasi Posyandu */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-sm">
                                Puskesmas Pembina
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Building2
                                    size={18}
                                    className="text-gray-400"
                                />
                                {/* --- PERBAIKAN DI SINI --- */}
                                <p className="text-lg text-gray-800">
                                    {posyandu.puskesmas_pembina}
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-sm">
                                Alamat Lengkap
                            </h3>
                            <p className="text-lg text-gray-800">{`RT ${posyandu.rt}/${posyandu.rw}, ${posyandu.address}`}</p>
                        </div>
                    </div>

                    {/* Kolom Kanan: Informasi Wilayah */}
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                        <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-sm">
                            Wilayah Administrasi
                        </h3>
                        <div className="space-y-2 text-gray-700">
                            <p>
                                <span className="font-medium w-28 inline-block">
                                    Desa/Kel:
                                </span>{" "}
                                {posyandu.village?.name || "N/A"}
                            </p>
                            <p>
                                <span className="font-medium w-28 inline-block">
                                    Kecamatan:
                                </span>{" "}
                                {posyandu.village?.district?.name || "N/A"}
                            </p>
                            <p>
                                <span className="font-medium w-28 inline-block">
                                    Kab/Kota:
                                </span>{" "}
                                {posyandu.village?.district?.regency?.name ||
                                    "N/A"}
                            </p>
                            <p>
                                <span className="font-medium w-28 inline-block">
                                    Provinsi:
                                </span>{" "}
                                {posyandu.village?.district?.regency?.province
                                    ?.name || "N/A"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
