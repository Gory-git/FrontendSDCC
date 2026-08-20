import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { observeAuth } from "./auth-client";
import type { User } from "firebase/auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null | undefined>(undefined);

    useEffect(() => {
        return observeAuth(setUser);
    }, []);

    if (user === undefined) return <p>Caricamento...</p>;
    if (!user) return <Navigate to="/login" replace />;

    return <>{children}</>;
}
