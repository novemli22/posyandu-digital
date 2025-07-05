import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const token = localStorage.getItem("auth_token");
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
