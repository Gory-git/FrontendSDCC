import { useEffect, useState } from "react";
import { getCurrentUser } from "../../api/user";
import type { UserDTO } from "../../api/types";

export default function UserPage() {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getCurrentUser()
            .then(setUser)
            .catch((e) => setError(e instanceof Error ? e.message : "Errore"))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <p>Caricamento utente...</p>;
    if (error) return <p>Errore: {error}</p>;
    if (!user) return <p>Nessun utente.</p>;

    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold">Profilo</h2>
            <p>{user.name} {user.surname}</p>
            <p>{user.email}</p>
            <p>{user.phone}</p>
            <p>{user.role}</p>
        </div>
    );
}
