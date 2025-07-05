import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
    const user = JSON.parse(localStorage.getItem("auth_user"));

    // Cek apakah ada user DAN rolenya adalah ADMIN
    if (user && user.role === "ADMIN") {
        // Jika ya, izinkan masuk ke halaman selanjutnya
        return <Outlet />;
    }

    // Jika tidak, tendang ke halaman login
    return <Navigate to="/login" replace />;
};

export default AdminRoute;
