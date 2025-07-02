export default function Navbar() {
    const user = JSON.parse(localStorage.getItem("auth_user"));

    return (
        <header className="bg-white shadow-md p-4 flex justify-end items-center">
            <div className="flex items-center space-x-4">
                <span>Halo, **{user ? user.name : "Tamu"}**</span>
                <button className="p-2 rounded bg-red-500 text-white hover:bg-red-600">
                    Logout
                </button>
            </div>
        </header>
    );
}
