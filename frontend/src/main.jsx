import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

// Impor Halaman & Layout
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import MainLayout from "./components/layout/MainLayout.jsx"; // <-- 1. IMPORT LAYOUT BARU

// Buat 'peta' rute aplikasi kita
const router = createBrowserRouter([
    // Rute publik (tanpa sidebar & navbar)
    { path: "/", element: <HomePage /> },
    { path: "/login", element: <LoginPage /> },

    // Rute yang dilindungi (menggunakan layout)
    {
        element: <MainLayout />, // <-- 2. JADIKAN LAYOUT SEBAGAI INDUK
        children: [
            // <-- 3. BUAT HALAMAN DI DALAMNYA SEBAGAI ANAK
            {
                path: "/dashboard",
                element: <DashboardPage />,
            },
            // Nanti rute lain seperti /kader, /ibu, dll. kita tambahkan di sini
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
