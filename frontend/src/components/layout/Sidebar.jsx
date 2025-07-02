import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, UserPlus, Baby } from "lucide-react";

const menuItems = [
    { to: "/dashboard", icon: LayoutDashboard, text: "Dashboard" },
    { to: "/kader", icon: Users, text: "Manajemen Kader" },
];

export default function Sidebar() {
    const baseLinkStyle =
        "flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors";
    const activeLinkStyle = "bg-indigo-600 text-white font-semibold";

    return (
        <aside className="w-64 flex-shrink-0 bg-gray-800 p-4 flex flex-col">
            <div className="text-2xl font-bold text-white mb-8 text-center border-b border-gray-700 pb-4">
                Posyandu Digital
            </div>
            <nav>
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.text} className="mb-3">
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    `${baseLinkStyle} ${
                                        isActive ? activeLinkStyle : ""
                                    }`
                                }
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.text}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
