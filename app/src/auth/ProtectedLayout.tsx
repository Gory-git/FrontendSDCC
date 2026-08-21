import { NavLink, Outlet, useNavigate } from "react-router";
import RequireAuth from "./RequireAuth";
import { logout } from "./auth-client";
import { useCurrentUser } from "../features/user/hooks";
import { Button } from "../components/Button";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive ? "bg-brand-light text-brand" : "text-slate-600 hover:bg-slate-100"
    }`;

function Nav() {
    const navigate = useNavigate();
    const { data: currentUser } = useCurrentUser();

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    return (
        <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <span className="text-lg font-bold text-slate-900 shrink-0">
                        Receipt<span className="text-brand">Hub</span>
                    </span>
                    <div className="flex gap-1">
                        <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                        {currentUser?.role === "ROLE_ADMIN" && (
                            <NavLink to="/admin/users" className={navLinkClass}>Utenti</NavLink>
                        )}
                        <NavLink to="/products" className={navLinkClass}>Prodotti</NavLink>
                        <NavLink to="/receipts" className={navLinkClass} end>Ricevute</NavLink>
                        <NavLink to="/receipts/new" className={navLinkClass}>Nuova ricevuta</NavLink>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {currentUser && (
                        <span className="hidden sm:inline text-sm text-slate-500">{currentUser.email}</span>
                    )}
                    <Button variant="ghost" onClick={handleLogout} className="px-3 py-1.5">
                        Esci
                    </Button>
                </div>
            </div>
        </nav>
    );
}

export default function ProtectedLayout() {
    return (
        <RequireAuth>
            <div className="min-h-screen">
                <Nav />
                <Outlet />
            </div>
        </RequireAuth>
    );
}
