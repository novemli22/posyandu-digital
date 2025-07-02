import { ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const user = JSON.parse(localStorage.getItem("auth_user"));
    const navigate = useNavigate();

    const handleLogout = () => {
        // Hapus data dari localStorage
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        // Arahkan ke halaman login
        navigate("/login");
    };

    return (
        <header className="bg-white shadow-sm p-4 flex justify-end items-center h-16">
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <div className="font-semibold">
                        {user ? user.name : "Tamu"}
                    </div>
                    <div className="text-xs text-gray-500">
                        {user ? user.role : "Role"}
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    title="Logout"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
