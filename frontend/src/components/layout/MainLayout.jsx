import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import { PosyanduProvider } from "../../contexts/PosyanduContext";

export default function MainLayout() {
    return (
        <PosyanduProvider>
            <div className="flex h-screen bg-gray-200">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </PosyanduProvider>
    );
}
