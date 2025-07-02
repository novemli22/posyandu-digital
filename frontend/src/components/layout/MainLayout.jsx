import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
    return (
        <div className="flex h-screen bg-gray-200">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <Outlet /> {/* "Bingkai foto" untuk konten halaman */}
                </main>
            </div>
        </div>
    );
}
