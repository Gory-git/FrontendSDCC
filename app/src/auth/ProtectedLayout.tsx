import { NavLink, Outlet, useNavigate } from "react-router";
import RequireAuth from "./RequireAuth";
import RequireProfile from "./RequireProfile";
import { logout } from "./auth-client";
import { useCurrentUser } from "../features/user/hooks";
import { Button } from "../components/Button";
import { ThemeToggle } from "../components/ThemeToggle";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive ? "bg-brand-light text-brand-fg" : "text-fg-muted hover:bg-muted"
    }`;

function Nav() {
    const navigate = useNavigate();
    const { data: currentUser } = useCurrentUser();

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    return (
        <nav className="sticky top-0 z-10 border-b border-line bg-card/80 backdrop-blur">
            <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-6 flex-wrap">
                    <span className="text-lg font-bold text-fg shrink-0">
                        Receipt<span className="text-brand-fg">Hub</span>
                    </span>
                    <div className="flex gap-1 flex-wrap">
                        <NavLink to="/dashboard" className={navLinkClass}>{currentUser?.name ?? "Dashboard"}</NavLink>
                        {currentUser?.role === "ROLE_ADMIN" && (
                            <NavLink to="/admin/stats" className={navLinkClass}>Statistiche</NavLink>
                        )}
                        {currentUser?.role === "ROLE_ADMIN" && (
                            <NavLink to="/admin/users" className={navLinkClass}>Utenti</NavLink>
                        )}
                        <NavLink to="/products" className={navLinkClass}>Prodotti</NavLink>
                        <NavLink to="/receipts" className={navLinkClass}>Ricevute</NavLink>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <ThemeToggle />
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
            <RequireProfile>
                <div className="min-h-screen">
                    <Nav />
                    <Outlet />
                </div>
            </RequireProfile>
        </RequireAuth>
    );
}
