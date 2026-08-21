import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "../features/user/hooks";

export default function AdminOnlyLayout() {
    const { data: currentUser, isLoading } = useCurrentUser();

    if (isLoading) {
        return (
            <div className="flex justify-center py-16 text-slate-500">
                Caricamento...
            </div>
        );
    }
    if (currentUser?.role !== "ROLE_ADMIN") {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
