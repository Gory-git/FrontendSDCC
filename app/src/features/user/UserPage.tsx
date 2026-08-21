import { useEffect, useState } from "react";
import { getCurrentUser } from "../../api/user";
import type { UserDTO } from "../../api/types";
import { Card } from "../../components/Card";

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

    if (isLoading) return <Card className="text-slate-500">Caricamento utente...</Card>;
    if (error) return <Card className="text-red-600">Errore: {error}</Card>;
    if (!user) return <Card className="text-slate-500">Nessun utente.</Card>;

    return (
        <Card className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">Profilo</h2>
            <p className="text-slate-700">{user.name} {user.surname}</p>
            <p className="text-slate-500 text-sm">{user.email}</p>
            <p className="text-slate-500 text-sm">{user.phone}</p>
        </Card>
    );
}
