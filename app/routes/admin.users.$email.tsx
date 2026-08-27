import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { useReceiptsByUserEmail } from "../src/features/receipts/hooks";
import { PageContainer } from "../src/components/PageContainer";
import { Loading } from "../src/components/Loading";
import { errorMessage } from "../src/lib/errorMessage";
import { ReceiptRow } from "../src/features/receipts/ReceiptRow";

export default function AdminUserReceiptsPage() {
    const { email = "" } = useParams();
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
                <h1 className="text-2xl font-bold text-fg mt-1">Ricevute di {email}</h1>
            </div>

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
