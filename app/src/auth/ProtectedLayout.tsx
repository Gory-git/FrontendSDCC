import { NavLink, Outlet, useNavigate } from "react-router";
import RequireAuth from "./RequireAuth";
import { logout } from "./auth-client";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded text-sm font-medium ${
        isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
    }`;

function Nav() {
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    return (
        <nav className="border-b bg-white">
            <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
                <div className="flex gap-2">
                    <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                    <NavLink to="/receipts" className={navLinkClass}>Ricevute</NavLink>
                    <NavLink to="/receipts/new" className={navLinkClass}>Nuova ricevuta</NavLink>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-slate-500 hover:text-slate-900"
                >
                    Esci
                </button>
            </div>
        </nav>
    );
}

export default function ProtectedLayout() {
    return (
        <RequireAuth>
            <Nav />
            <Outlet />
        </RequireAuth>
    );
}
