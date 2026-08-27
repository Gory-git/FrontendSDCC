import { useEffect, useRef } from "react";
import { Navigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthUser } from "./useAuthUser";
import { Loading } from "../components/Loading";
import { clearConversation } from "../features/chat/conversation";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const user = useAuthUser();
    const queryClient = useQueryClient();
    const lastUid = useRef<string | null | undefined>(undefined);

    // Rete di sicurezza per i cambi di sessione che non passano dal pulsante "Esci"
    // (login in un'altra scheda, token revocato): se l'identità cambia, la cache
    // dell'utente precedente non deve sopravvivere.
    useEffect(() => {
        if (user === undefined) return;
        const uid = user?.uid ?? null;
        if (lastUid.current !== undefined && lastUid.current !== uid) {
            queryClient.clear();
            clearConversation();
        }
        lastUid.current = uid;
    }, [user, queryClient]);

    if (user === undefined) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loading label="Caricamento..." size="lg" />
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;

    return <>{children}</>;
}
