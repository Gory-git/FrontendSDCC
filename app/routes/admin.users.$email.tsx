import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { useReceiptsByUserEmail } from "../src/features/receipts/hooks";
import { PageContainer } from "../src/components/PageContainer";
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
                <Link to="/admin/users" className="text-sm text-brand hover:text-brand-hover">
                    ← Tutti gli utenti
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">Ricevute di {email}</h1>
            </div>

            {isLoading && <p className="text-slate-500">Caricamento ricevute...</p>}
            {isError && <p className="text-red-600">Errore: {(error as Error).message}</p>}
            {!isLoading && !isError && exactData?.length === 0 && (
                <p className="text-slate-500">Questo utente non ha ancora ricevute.</p>
            )}

            <div className="space-y-3">
                {exactData?.map((receipt) => (
                    <ReceiptRow key={receipt.code} receipt={receipt} />
                ))}
            </div>
        </PageContainer>
    );
}
