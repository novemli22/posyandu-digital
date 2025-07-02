import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

// Impor Layout & Halaman
import MainLayout from "./components/layout/MainLayout.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import KaderPage from "./pages/KaderPage.jsx";

const router = createBrowserRouter([
    // Rute publik (tanpa sidebar & navbar)
    { path: "/", element: <HomePage /> },
    { path: "/login", element: <LoginPage /> },

    // Rute yang menggunakan MainLayout
    {
        element: <MainLayout />, // <-- Layout sebagai 'induk'
        children: [
            // <-- Halaman-halaman di dalamnya sebagai 'anak'
            {
                path: "/dashboard",
                element: <DashboardPage />,
            },
            {
                path: "/kader",
                element: <KaderPage />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
