import React from "react";
import ReactDOM from "react-dom/client";
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";
import "./index.css";

// --- Impor Komponen Inti ---
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import MainLayout from "./components/layout/MainLayout.jsx";
import { PosyanduProvider } from "./contexts/PosyanduContext.jsx";

// --- Impor Semua Halaman ---
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import PosyanduPage from "./pages/PosyanduPage.jsx";
import PosyanduDetailPage from "./pages/PosyanduDetailPage.jsx";
import KaderPage from "./pages/KaderPage.jsx";
import KaderDetailPage from "./pages/KaderDetailPage.jsx"; // <-- 1. IMPORT HALAMAN DETAIL KADER
import IbuPage from "./pages/IbuPage.jsx";
import IbuDetailPage from "./pages/IbuDetailPage.jsx";
import AnakPage from "./pages/AnakPage.jsx";
import PemeriksaanIbuPage from "./pages/PemeriksaanIbuPage.jsx";
import PemeriksaanAnakPage from "./pages/PemeriksaanAnakPage.jsx";
import EdukasiPage from "./pages/EdukasiPage.jsx";
import LaporanPage from "./pages/LaporanPage.jsx";
import NotifikasiPage from "./pages/NotifikasiPage.jsx";

const router = createBrowserRouter([
    { path: "/login", element: <LoginPage /> },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AdminRoute />,
                children: [
                    {
                        path: "/admin",
                        element: (
                            <PosyanduProvider>
                                <MainLayout />
                            </PosyanduProvider>
                        ),
                        children: [
                            { path: "dashboard", element: <DashboardPage /> },
                            { path: "posyandu", element: <PosyanduPage /> },
                            {
                                path: "posyandu/:posyanduId",
                                element: <PosyanduDetailPage />,
                            },
                            { path: "kader", element: <KaderPage /> },
                            // 2. TAMBAHKAN RUTE DETAIL KADER DI SINI
                            {
                                path: "kader/:kaderId",
                                element: <KaderDetailPage />,
                            },
                            { path: "ibu", element: <IbuPage /> },
                            {
                                path: "ibu/:ibuId",
                                element: <IbuDetailPage />,
                            },
                            { path: "anak", element: <AnakPage /> },
                            {
                                path: "pemeriksaan-ibu",
                                element: <PemeriksaanIbuPage />,
                            },
                            {
                                path: "pemeriksaan-anak",
                                element: <PemeriksaanAnakPage />,
                            },
                            { path: "edukasi", element: <EdukasiPage /> },
                            { path: "laporan", element: <LaporanPage /> },
                            { path: "notifikasi", element: <NotifikasiPage /> },
                        ],
                    },
                ],
            },
        ],
    },
    { path: "/", element: <Navigate to="/admin/dashboard" replace /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
