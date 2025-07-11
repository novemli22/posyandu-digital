import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

// 1. Membuat "wadah" untuk papan pengumuman kita
export const PosyanduContext = createContext();

// 2. Membuat komponen "Penyedia Papan Pengumuman"
export const PosyanduProvider = ({ children }) => {
    const [posyandus, setPosyandus] = useState([]);
    const token = localStorage.getItem("auth_token");
    const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

    // Buat fungsi untuk mengambil data yang bisa dipanggil ulang
    const fetchPosyandus = useCallback(async () => {
        if (token) {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/posyandus",
                    API_CONFIG
                );
                setPosyandus(response.data);
            } catch (error) {
                console.error("Gagal mengambil data Posyandu global:", error);
            }
        }
    }, [token]); // useCallback akan mengingat fungsi ini selama token tidak berubah

    // Ambil data posyandu sekali saja saat provider ini pertama kali dimuat
    useEffect(() => {
        fetchPosyandus();
    }, [fetchPosyandus]);

    // Sediakan data posyandu DAN fungsi untuk me-refreshnya
    const value = {
        posyandus,
        refreshPosyandus: fetchPosyandus,
    };

    return (
        <PosyanduContext.Provider value={value}>
            {children}
        </PosyanduContext.Provider>
    );
};
