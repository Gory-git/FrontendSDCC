import { Navigate } from "react-router";
import { useAuthUser } from "./useAuthUser";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const user = useAuthUser();

    if (user === undefined) {
        return (
            <div className="flex min-h-screen items-center justify-center text-slate-500">
                Caricamento...
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;

    return <>{children}</>;
}
