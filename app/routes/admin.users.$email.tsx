import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { useReceiptsByUserEmail } from "../src/features/receipts/hooks";
import { useUpdateUserByEmail, useUserByEmail } from "../src/features/user/hooks";
import { ProfileForm } from "../src/features/user/ProfileForm";
import { PageContainer } from "../src/components/PageContainer";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { Loading } from "../src/components/Loading";
import { errorMessage } from "../src/lib/errorMessage";
import { ReceiptRow } from "../src/features/receipts/ReceiptRow";
import { currencyFormatter } from "../src/features/receipts/formatters";
import type { ReceiptDTO, UserDTO } from "../src/api/types";

function Riga({ etichetta, valore }: { etichetta: string; valore: string }) {
    return (
        <div>
            <dt className="text-xs uppercase tracking-wide text-fg-muted">{etichetta}</dt>
            <dd className="text-sm text-fg-secondary">{valore}</dd>
        </div>
    );
}

function SchedaUtente({ user, receipts }: { user: UserDTO; receipts: ReceiptDTO[] | undefined }) {
    const totale = useMemo(
        () => receipts?.reduce((somma, r) => somma + Number(r.amount), 0) ?? 0,
        [receipts]
    );
    const modifica = useUpdateUserByEmail(user.email);
    const [isEditing, setIsEditing] = useState(false);

    return (
        <Card className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-fg">{user.name} {user.surname}</h2>
                    <p className="text-sm text-fg-muted">{user.email}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium uppercase tracking-wide text-brand-fg">
                        {user.role === "ROLE_ADMIN" ? "Admin" : "Utente"}
                    </span>
                    {!isEditing && (
                        <Button variant="secondary" className="px-3 py-1.5"
                                onClick={() => setIsEditing(true)}>
                            Modifica
                        </Button>
                    )}
                </div>
            </div>

            {isEditing ? (
                <ProfileForm user={user} mutation={modifica}
                             onClose={() => setIsEditing(false)} />
            ) : (
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Riga etichetta="Telefono" valore={user.phone || "Non inserito"} />
                    <Riga etichetta="Codice fiscale" valore={user.codiceFiscale || "Non inserito"} />
                    <Riga etichetta="Ricevute" valore={receipts ? String(receipts.length) : "—"} />
                    <Riga etichetta="Totale speso" valore={receipts ? currencyFormatter.format(totale) : "—"} />
                </dl>
            )}
        </Card>
    );
}

export default function AdminUserDetailPage() {
    const { email = "" } = useParams();

    const utente = useUserByEmail(email);
    // threshold=1 è il valore più restrittivo che il backend accetta, ma il
    // punteggio fuzzy resta comunque un match "somigliante": qui vogliamo le
    // ricevute di QUESTO utente esatto, quindi filtriamo per email esatta
    // sul risultato invece di fidarci solo della soglia.
    const { data, isLoading, isError, error } = useReceiptsByUserEmail(email, 1);
    const exactData = useMemo(
        () => data?.filter((receipt) => receipt.userEmail === email),
        [data, email]
    );

    return (
        <PageContainer>
            <div>
                <Link to="/admin/users" className="text-sm text-brand-fg hover:text-brand-hover">
                    ← Tutti gli utenti
                </Link>
                <h1 className="text-2xl font-bold text-fg mt-1">
                    {utente.data ? `${utente.data.name} ${utente.data.surname}` : email}
                </h1>
            </div>

            {utente.isLoading && <Loading label="Caricamento utente..." />}
            {utente.isError && (
                <p className="text-danger">
                    {errorMessage(utente.error, "Non è stato possibile caricare i dati dell'utente.")}
                </p>
            )}
            {/* Query riuscita ma nessuna corrispondenza: l'email nell'indirizzo non
                appartiene a nessun utente. Distinto da un errore di caricamento. */}
            {!utente.isLoading && !utente.isError && !utente.data && (
                <Card className="text-fg-muted">Nessun utente con l'email {email}.</Card>
            )}
            {utente.data && <SchedaUtente user={utente.data} receipts={exactData} />}

            <h2 className="text-lg font-semibold text-fg">Ricevute</h2>

            {isLoading && <Loading label="Caricamento ricevute..." />}
            {isError && <p className="text-danger">{errorMessage(error, "Non è stato possibile caricare le ricevute di questo utente.")}</p>}
            {!isLoading && !isError && exactData?.length === 0 && (
                <p className="text-fg-muted">Questo utente non ha ancora ricevute.</p>
            )}

            <div className="space-y-3">
                {exactData?.map((receipt) => (
                    <ReceiptRow key={receipt.code} receipt={receipt} />
                ))}
            </div>
        </PageContainer>
    );
}
