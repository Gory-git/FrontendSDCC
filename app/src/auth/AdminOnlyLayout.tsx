import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "../features/user/hooks";
import { Loading } from "../components/Loading";

export default function AdminOnlyLayout() {
    const { data: currentUser, isLoading } = useCurrentUser();

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <Loading label="Caricamento..." size="lg" />
            </div>
        );
    }
    if (currentUser?.role !== "ROLE_ADMIN") {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
