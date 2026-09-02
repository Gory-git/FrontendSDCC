import { useState } from "react";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Loading } from "../../components/Loading";
import { errorMessage } from "../../lib/errorMessage";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { ProfileForm } from "./ProfileForm";
import { useCurrentUser, useUpdateCurrentUser } from "./hooks";

/** I due form occupano lo stesso spazio: aprirne uno chiude l'altro. */
type Pannello = "nessuno" | "profilo" | "password";

export default function UserPage() {
    const { data: user, isLoading, isError, error } = useCurrentUser();
    const updateUser = useUpdateCurrentUser();
    const [pannello, setPannello] = useState<Pannello>("nessuno");
    const [passwordCambiata, setPasswordCambiata] = useState(false);

    if (isLoading) return <Card><Loading label="Caricamento profilo..." /></Card>;
    if (isError) return <Card className="text-danger">{errorMessage(error, "Non è stato possibile caricare il profilo.")}</Card>;
    if (!user) return <Card className="text-fg-muted">Nessun utente.</Card>;

    function apri(quale: Pannello) {
        setPasswordCambiata(false);
        setPannello(quale);
    }

    return (
        <Card className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-fg">Profilo</h2>
                {pannello === "nessuno" && (
                    <div className="flex items-center gap-2 shrink-0">
                        <Button variant="secondary" className="px-3 py-1.5"
                                onClick={() => apri("profilo")}>
                            Modifica
                        </Button>
                        <Button variant="secondary" className="px-3 py-1.5"
                                onClick={() => apri("password")}>
                            Cambia password
                        </Button>
                    </div>
                )}
            </div>

            {pannello === "profilo" && (
                <ProfileForm user={user} mutation={updateUser}
                             onClose={() => setPannello("nessuno")} />
            )}

            {pannello === "password" && (
                <ChangePasswordForm
                    onCancel={() => setPannello("nessuno")}
                    onSuccess={() => {
                        setPannello("nessuno");
                        setPasswordCambiata(true);
                    }}
                />
            )}

            {pannello === "nessuno" && (
                <div className="space-y-1">
                    <p className="text-fg-secondary">{user.name} {user.surname}</p>
                    <p className="text-fg-muted text-sm">{user.email}</p>
                    <p className="text-fg-muted text-sm">{user.phone || "Telefono non inserito"}</p>
                    <p className="text-fg-muted text-sm">
                        {user.codiceFiscale || "Codice fiscale non inserito"}
                    </p>
                    {passwordCambiata && (
                        <p className="text-sm text-success pt-2">Password aggiornata.</p>
                    )}
                </div>
            )}
        </Card>
    );
}
