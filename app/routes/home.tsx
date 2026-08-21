import { Navigate } from "react-router";
import { useAuthUser } from "../src/auth/useAuthUser";
import { PublicHeader } from "../src/components/PublicHeader";
import { LinkButton } from "../src/components/Button";

export default function Home() {
    const user = useAuthUser();

    if (user === undefined) {
        return (
            <div className="flex min-h-screen items-center justify-center text-slate-500">
                Caricamento...
            </div>
        );
    }
    if (user) return <Navigate to="/dashboard" replace />;

    return (
        <div className="flex min-h-screen flex-col">
            <PublicHeader />
            <div className="flex flex-1 items-center justify-center px-6">
                <div className="max-w-xl text-center space-y-6">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                        Receipt<span className="text-brand">Hub</span>
                    </h1>
                    <p className="text-lg text-slate-600">
                        Gestisci le tue ricevute in un unico posto: caricale a mano o in PDF,
                        ritrovale quando vuoi e tieni sotto controllo le tue spese.
                    </p>
                    <div className="flex items-center justify-center gap-4 pt-2">
                        <LinkButton to="/login" variant="primary" className="px-6 py-3 text-base">
                            Accedi
                        </LinkButton>
                        <LinkButton to="/register" variant="secondary" className="px-6 py-3 text-base">
                            Registrati
                        </LinkButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
