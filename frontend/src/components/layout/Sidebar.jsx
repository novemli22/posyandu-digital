export default function Sidebar() {
    return (
        <aside className="w-64 flex-shrink-0 bg-gray-800 text-white p-4">
            <div className="text-2xl font-semibold mb-6">Posyandu Digital</div>
            <nav>
                <ul>
                    <li className="mb-2">
                        <a
                            href="/dashboard"
                            className="block p-2 rounded hover:bg-gray-700"
                        >
                            Dashboard
                        </a>
                    </li>
                    <li className="mb-2">
                        <a
                            href="/kader"
                            className="block p-2 rounded hover:bg-gray-700"
                        >
                            Manajemen Kader
                        </a>
                    </li>
                    <li className="mb-2">
                        <a
                            href="/ibu"
                            className="block p-2 rounded hover:bg-gray-700"
                        >
                            Manajemen Ibu
                        </a>
                    </li>
                    <li className="mb-2">
                        <a
                            href="/anak"
                            className="block p-2 rounded hover:bg-gray-700"
                        >
                            Manajemen Anak
                        </a>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}
