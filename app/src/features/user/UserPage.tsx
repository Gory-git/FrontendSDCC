import { useState } from "react";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Loading } from "../../components/Loading";
import { errorMessage } from "../../lib/errorMessage";
import { ProfileForm } from "./ProfileForm";
import { useCurrentUser, useUpdateCurrentUser } from "./hooks";

export default function UserPage() {
    const { data: user, isLoading, isError, error } = useCurrentUser();
    const updateUser = useUpdateCurrentUser();
    const [isEditing, setIsEditing] = useState(false);

    if (isLoading) return <Card><Loading label="Caricamento profilo..." /></Card>;
    if (isError) return <Card className="text-danger">{errorMessage(error, "Non è stato possibile caricare il profilo.")}</Card>;
    if (!user) return <Card className="text-fg-muted">Nessun utente.</Card>;

    return (
        <Card className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-fg">Profilo</h2>
                {!isEditing && (
                    <Button variant="secondary" className="px-3 py-1.5"
                            onClick={() => setIsEditing(true)}>
                        Modifica
                    </Button>
                )}
            </div>

            {isEditing ? (
                <ProfileForm user={user} mutation={updateUser}
                             onClose={() => setIsEditing(false)} />
            ) : (
                <div className="space-y-1">
                    <p className="text-fg-secondary">{user.name} {user.surname}</p>
                    <p className="text-fg-muted text-sm">{user.email}</p>
                    <p className="text-fg-muted text-sm">{user.phone || "Telefono non inserito"}</p>
                    <p className="text-fg-muted text-sm">
                        {user.codiceFiscale || "Codice fiscale non inserito"}
                    </p>
                </div>
            )}
        </Card>
    );
}
