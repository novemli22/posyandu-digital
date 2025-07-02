import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    // Cek apakah ada 'tiket masuk' (token) di penyimpanan browser
    const token = localStorage.getItem("auth_token");

    // Jika ada tiket, izinkan masuk ke halaman tujuan (Outlet).
    // Jika tidak, "tendang" ke halaman login.
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
