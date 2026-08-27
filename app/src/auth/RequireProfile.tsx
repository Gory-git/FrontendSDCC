import { Loading } from "../components/Loading";
import { errorMessage, isNotFound } from "../lib/errorMessage";
import { useCurrentUser } from "../features/user/hooks";
import { useAuthUser } from "./useAuthUser";
import CompleteProfile from "./CompleteProfile";

/**
 * Secondo cancello, dopo RequireAuth: essere autenticati su Firebase non basta,
 * serve anche una riga nel database. Sono due condizioni distinte e possono
 * divergere, quindi hanno due guardie separate.
 */
export default function RequireProfile({ children }: { children: React.ReactNode }) {
    const authUser = useAuthUser();
    const { data: currentUser, isLoading, isError, error, refetch } = useCurrentUser();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loading label="Caricamento profilo..." size="lg" />
            </div>
        );
    }

    // 404 = autenticato ma senza profilo: non è un errore, è uno stato da cui
    // si esce compilando i dati.
    if (isError && isNotFound(error))
        return <CompleteProfile email={authUser?.email ?? null} />;

    // Un errore vero (server irraggiungibile, 500) non deve trasformarsi in una
    // richiesta di registrazione: sarebbe fuorviante e creerebbe doppioni.
    if (isError || !currentUser) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-danger">
                    {errorMessage(error, "Non è stato possibile caricare il profilo.")}
                </p>
                <button
                    onClick={() => refetch()}
                    className="text-brand-fg font-semibold text-sm"
                >
                    Riprova
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
