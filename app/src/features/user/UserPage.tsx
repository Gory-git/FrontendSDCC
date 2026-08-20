import { useCurrentUser } from "./hooks";

export function UserPage() {
    const { data, isLoading, isError, error } = useCurrentUser();

    if (isLoading) return <p>Caricamento utente...</p>;
    if (isError) return <p>Errore: {(error as Error).message}</p>;
    if (!data) return <p>Nessun dato utente.</p>;

    return (
        <div className="space-y-2">
            <h1 className="text-2xl font-bold">Profilo</h1>
            <p><strong>Nome:</strong> {data.name}</p>
            <p><strong>Cognome:</strong> {data.surname}</p>
            <p><strong>Email:</strong> {data.email}</p>
            <p><strong>Telefono:</strong> {data.phone}</p>
            <p><strong>Ruolo:</strong> {data.role}</p>
            <p><strong>Data di nascita:</strong> {new Date(data.birthDate).toLocaleDateString()}</p>
        </div>
    );
}
