import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
    ArrowLeft,
    User,
    HeartPulse,
    Home,
    Shield,
    FileText,
    Briefcase,
    MapPin,
    Building2,
    BookUser,
    Baby,
    Phone,
} from "lucide-react";

export default function IbuDetailPage() {
    const { ibuId } = useParams();
    const [ibu, setIbu] = useState(null);
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
                    `http://localhost:8000/api/ibus/${ibuId}`,
                    API_CONFIG
                );
                setIbu(response.data);
            } catch (err) {
                console.error("Gagal mengambil detail ibu:", err);
                setError("Gagal memuat data. Pastikan data ada dan coba lagi.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [ibuId]);

    if (loading)
        return (
            <div className="p-10 text-center">Memuat data detail ibu...</div>
        );
    if (error)
        return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!ibu)
        return (
            <div className="p-10 text-center">Data ibu tidak ditemukan.</div>
        );

    const DetailItem = ({ label, value, className = "" }) => (
        <div className={className}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-md font-semibold text-gray-800">
                {value || "-"}
            </p>
        </div>
    );

    return (
        <div>
            <Link
                to="/admin/ibu"
                className="flex items-center gap-2 text-indigo-600 hover:underline mb-6 font-medium"
            >
                <ArrowLeft size={18} />
                Kembali ke Daftar Ibu
            </Link>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-6 pb-6 border-b">
                    <div className="bg-pink-100 p-4 rounded-full">
                        <User className="h-10 w-10 text-pink-600" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">
                            {ibu.nama_lengkap}
                        </h1>
                        <p className="text-md text-gray-500">
                            NIK: {ibu.nik || "Tidak Ada"}
                        </p>
                        <p className="text-md text-gray-500">
                            Email: {ibu.user?.email}
                        </p>
                    </div>
                </div>

                <div className="space-y-8">
                    <section>
                        <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                            <HeartPulse size={20} className="text-pink-500" />{" "}
                            Data Kehamilan
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                            <DetailItem
                                label="Kehamilan Ke-"
                                value={ibu.kehamilan_ke}
                            />
                            <DetailItem label="HPHT" value={ibu.hpht} />
                            <DetailItem label="HPL" value={ibu.hpl} />
                            <DetailItem
                                label="Jarak Kehamilan"
                                value={
                                    ibu.jarak_kehamilan_bulan
                                        ? `${ibu.jarak_kehamilan_bulan} bulan`
                                        : "-"
                                }
                            />
                            <DetailItem
                                label="BB Awal"
                                value={`${ibu.bb_awal} kg`}
                            />
                            <DetailItem
                                label="TB Awal"
                                value={`${ibu.tb_awal} cm`}
                            />
                            <DetailItem
                                label="KTD"
                                value={ibu.is_ktd ? "Ya" : "Tidak"}
                            />
                            <DetailItem
                                label="Punya Buku KIA?"
                                value={ibu.punya_buku_kia ? "Ya" : "Tidak"}
                            />
                        </div>
                    </section>

                    <section>
                        <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                            <User size={20} /> Data Suami
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                            <DetailItem
                                label="Nama Suami"
                                value={ibu.nama_suami}
                            />
                            <DetailItem
                                label="NIK Suami"
                                value={ibu.nik_suami}
                            />
                            <DetailItem
                                label="No. HP Suami"
                                value={ibu.nomor_hp_suami}
                            />
                        </div>
                    </section>

                    <section>
                        <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                            <MapPin size={20} /> Alamat & Penempatan
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <DetailItem
                                    label="Alamat Lengkap"
                                    value={`${ibu.alamat_lengkap}, RT ${ibu.rt}/RW ${ibu.rw}`}
                                />
                                <DetailItem
                                    label="Desa/Kelurahan"
                                    value={ibu.posyandu?.village?.name}
                                    className="mt-2"
                                />
                                <DetailItem
                                    label="Kecamatan"
                                    value={
                                        ibu.posyandu?.village?.district?.name
                                    }
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <DetailItem
                                    label="Kabupaten/Kota"
                                    value={
                                        ibu.posyandu?.village?.district?.regency
                                            ?.name
                                    }
                                />
                                <DetailItem
                                    label="Provinsi"
                                    value={
                                        ibu.posyandu?.village?.district?.regency
                                            ?.province?.name
                                    }
                                    className="mt-2"
                                />
                                <DetailItem
                                    label="Posyandu Pembina"
                                    value={ibu.posyandu?.name}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                            <FileText size={20} /> Administrasi & Faskes
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                            <DetailItem
                                label="Jaminan Kesehatan"
                                value={ibu.jaminan_kesehatan}
                            />
                            <DetailItem
                                label="No. Jaminan"
                                value={ibu.nomor_jaminan_kesehatan}
                            />
                            <DetailItem
                                label="No. Kohort"
                                value={ibu.no_registrasi_kohort}
                            />
                            <DetailItem
                                label="Faskes TK 1"
                                value={ibu.faskes_tk1}
                            />
                            <DetailItem
                                label="Faskes Rujukan"
                                value={ibu.faskes_rujukan}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
