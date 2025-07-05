import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// 1. Membuat "wadah" untuk papan pengumuman kita
export const PosyanduContext = createContext();

// 2. Membuat komponen "Penyedia Papan Pengumuman"
export const PosyanduProvider = ({ children }) => {
    const [posyandus, setPosyandus] = useState([]);
    const token = localStorage.getItem("auth_token");

    // Ambil data posyandu sekali saja saat provider ini dimuat
    useEffect(() => {
        if (token) {
            // PERBAIKAN 1: Alamat API diubah menjadi /posyandus (dengan 's')
            axios
                .get("http://localhost:8000/api/posyandus", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((response) => {
                    setPosyandus(response.data);
                })
                .catch((error) =>
                    console.error(
                        "Gagal mengambil data posyandu global:",
                        error
                    )
                );
        }
        // PERBAIKAN 2: Ubah dependency array menjadi kosong []
        // Ini memastikan useEffect hanya berjalan satu kali saja.
    }, []);

    // Sediakan data posyandu ke semua "anak" komponen
    return (
        <PosyanduContext.Provider value={posyandus}>
            {children}
        </PosyanduContext.Provider>
    );
};
