import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Home,
    Users,
    UserPlus,
    Baby,
    Stethoscope,
    BookOpen,
    Bell,
    FileText,
    ChevronDown,
} from "lucide-react";

// Struktur menu baru yang mendukung submenu (children)
const menuItems = [
    { to: "/admin/dashboard", icon: LayoutDashboard, text: "Dashboard" },
    { to: "/admin/posyandu", icon: Home, text: "Manajemen Posyandu" },
    { to: "/admin/kader", icon: Users, text: "Manajemen Kader" },
    {
        text: "Data Peserta",
        icon: UserPlus,
        children: [
            { to: "/admin/ibu", icon: UserPlus, text: "Data Ibu" },
            { to: "/admin/anak", icon: Baby, text: "Data Anak" },
        ],
    },
    {
        text: "Data Pemeriksaan",
        icon: Stethoscope,
        children: [
            {
                to: "/admin/pemeriksaan-ibu",
                icon: UserPlus,
                text: "Pemeriksaan Ibu",
            },
            {
                to: "/admin/pemeriksaan-anak",
                icon: Baby,
                text: "Pemeriksaan Anak",
            },
        ],
    },
    { to: "/admin/edukasi", icon: BookOpen, text: "Edukasi" },
    { to: "/admin/notifikasi", icon: Bell, text: "Notifikasi" },
    { to: "/admin/laporan", icon: FileText, text: "Laporan" },
];

const NavItem = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);

    const baseLinkStyle =
        "flex items-center justify-between w-full p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors";
    const activeLinkStyle = "bg-indigo-600 text-white font-semibold";

    if (item.children) {
        return (
            <li>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`${baseLinkStyle}`}
                >
                    <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.text}</span>
                    </div>
                    <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                            isOpen ? "rotate-180" : ""
                        }`}
                    />
                </button>
                {isOpen && (
                    <ul className="pl-6 mt-2 space-y-2">
                        {item.children.map((child) => (
                            <li key={child.text}>
                                <NavLink
                                    to={child.to}
                                    className={({ isActive }) =>
                                        `flex items-center space-x-3 p-2 rounded-lg text-sm text-gray-400 hover:bg-gray-700 hover:text-white ${
                                            isActive
                                                ? "text-white font-semibold"
                                                : ""
                                        }`
                                    }
                                >
                                    <child.icon className="h-4 w-4" />
                                    <span>{child.text}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                )}
            </li>
        );
    }

    return (
        <li>
            <NavLink
                to={item.to}
                className={({ isActive }) =>
                    `${baseLinkStyle} ${isActive ? activeLinkStyle : ""}`
                }
            >
                <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.text}</span>
                </div>
            </NavLink>
        </li>
    );
};

export default function Sidebar() {
    return (
        <aside className="w-64 flex-shrink-0 bg-gray-800 text-white p-4 flex flex-col">
            <div className="text-2xl font-bold text-white mb-8 text-center border-b border-gray-700 pb-4">
                ADMIN PANEL
            </div>
            <nav>
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <NavItem key={item.text} item={item} />
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
