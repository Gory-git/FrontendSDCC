import { useState } from "react";
import { useReceipts, useReceiptsByAmountRange, useReceiptsByCard, useReceiptsByCode, useReceiptsByUserEmail } from "../src/features/receipts/hooks";
import { useCurrentUser } from "../src/features/user/hooks";
import { errorMessage } from "../src/lib/errorMessage";
import { PageContainer } from "../src/components/PageContainer";
import { Card } from "../src/components/Card";
import { Loading } from "../src/components/Loading";
import { Field } from "../src/components/Field";
import { Button, LinkButton } from "../src/components/Button";
import { ThresholdSlider } from "../src/components/ThresholdSlider";
import { lastFourDigits } from "../src/lib/card";
import { ReceiptRow } from "../src/features/receipts/ReceiptRow";
import type { ReceiptDTO } from "../src/api/types";

type Mode = "all" | "code" | "email" | "amount" | "card";

function ReceiptResults({
    data, isLoading, isError, error, emptyMessage,
}: {
    data: ReceiptDTO[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    emptyMessage: string;
}) {
    return (
        <>
            {isLoading && <Loading />}
            {isError && <p className="text-danger">{errorMessage(error, "Non è stato possibile caricare le ricevute.")}</p>}
            {!isLoading && !isError && data?.length === 0 && (
                <p className="text-fg-muted">{emptyMessage}</p>
            )}

            {/* Solo quando la query è andata a buon fine: in errore `data` può
                contenere ancora il risultato precedente. */}
            {!isError && (
                <div className="space-y-3">
                    {data?.map((receipt) => (
                        <ReceiptRow key={receipt.code} receipt={receipt} />
                    ))}
                </div>
            )}
        </>
    );
}

export default function ReceiptsPage() {
    const { data: currentUser } = useCurrentUser();
    const isAdmin = currentUser?.role === "ROLE_ADMIN";

    const [mode, setMode] = useState<Mode>("all");
    const [sortByDate, setSortByDate] = useState(true);
    const [sortDescending, setSortDescending] = useState(false);

    const [codeQuery, setCodeQuery] = useState("");
    const [codeThreshold, setCodeThreshold] = useState(0.5);

    const [cardQuery, setCardQuery] = useState("");
    const [emailQuery, setEmailQuery] = useState("");
    const [emailThreshold, setEmailThreshold] = useState(0.5);

    const [amountMinInput, setAmountMinInput] = useState("");
    const [amountMaxInput, setAmountMaxInput] = useState("");
    const amountMin = Number(amountMinInput);
    const amountMax = Number(amountMaxInput);
    const isAmountRangeValid = amountMinInput !== "" && amountMaxInput !== ""
        && Number.isFinite(amountMin) && Number.isFinite(amountMax)
        && amountMin >= 0 && amountMax >= amountMin;

    const allReceipts = useReceipts(sortByDate, mode === "all");
    // Il backend ordina sempre in modo crescente (data/importo più basso per primo);
    // l'inversione a decrescente è puramente lato client.
    const orderedReceipts = sortDescending && allReceipts.data
        ? [...allReceipts.data].reverse()
        : allReceipts.data;
    const codeResults = useReceiptsByCode(codeQuery.trim(), codeThreshold, mode === "code");
    // Il numero si riduce qui, prima della chiamata: quello che parte dal
    // browser sono solo quattro cifre.
    const cardLast4 = lastFourDigits(cardQuery);
    const cardResults = useReceiptsByCard(cardLast4, mode === "card");
    const emailResults = useReceiptsByUserEmail(emailQuery.trim(), emailThreshold, mode === "email" && isAdmin);
    const amountResults = useReceiptsByAmountRange(amountMin, amountMax, mode === "amount" && isAmountRangeValid);

    return (
        <PageContainer>
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-fg">Ricevute</h1>
                    <LinkButton to="/receipts/new" className="px-3 py-1.5">
                        + Nuova ricevuta
                    </LinkButton>
                </div>
                <div className="flex gap-1 rounded-lg border border-line bg-card p-1 flex-wrap">
                    <button
                        onClick={() => setMode("all")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            mode === "all" ? "bg-brand text-white" : "text-fg-muted hover:bg-muted"
                        }`}
                    >
                        Tutte
                    </button>
                    <button
                        onClick={() => setMode("code")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            mode === "code" ? "bg-brand text-white" : "text-fg-muted hover:bg-muted"
                        }`}
                    >
                        Cerca per codice
                    </button>
                    <button
                        onClick={() => setMode("amount")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            mode === "amount" ? "bg-brand text-white" : "text-fg-muted hover:bg-muted"
                        }`}
                    >
                        Cerca per importo
                    </button>
                    <button
                        onClick={() => setMode("card")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            mode === "card" ? "bg-brand text-white" : "text-fg-muted hover:bg-muted"
                        }`}
                    >
                        Cerca per carta
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setMode("email")}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                mode === "email" ? "bg-brand text-white" : "text-fg-muted hover:bg-muted"
                            }`}
                        >
                            Cerca per email utente
                        </button>
                    )}
                </div>
            </div>

            {mode === "all" && (
                <>
                    <div className="flex justify-end gap-2">
                        <div className="flex gap-1 rounded-lg border border-line bg-card p-1">
                            <button
                                onClick={() => setSortByDate(true)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    sortByDate ? "bg-brand text-white" : "text-fg-muted hover:bg-muted"
                                }`}
                            >
                                Ordina per data
                            </button>
                            <button
                                onClick={() => setSortByDate(false)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    !sortByDate ? "bg-brand text-white" : "text-fg-muted hover:bg-muted"
                                }`}
                            >
                                Ordina per importo
                            </button>
                        </div>
                        <button
                            onClick={() => setSortDescending((v) => !v)}
                            title={sortDescending ? "Decrescente" : "Crescente"}
                            className="flex items-center gap-1 rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-medium text-fg-muted hover:bg-muted transition-colors"
                        >
                            {sortDescending ? "↓ Decrescente" : "↑ Crescente"}
                        </button>
                    </div>

                    <ReceiptResults
                        data={orderedReceipts}
                        isLoading={allReceipts.isLoading}
                        isError={allReceipts.isError}
                        error={allReceipts.error}
                        emptyMessage="Nessuna ricevuta trovata."
                    />
                </>
            )}

            {mode === "code" && (
                <>
                    <Card className="space-y-4">
                        <Field
                            id="codeQuery"
                            label="Codice ricevuta"
                            value={codeQuery}
                            onChange={(e) => setCodeQuery(e.target.value)}
                            placeholder="es. REC-2025-001"
                        />
                        <ThresholdSlider id="codeThreshold" value={codeThreshold} onChange={setCodeThreshold} />
                    </Card>

                    {codeQuery.trim() === "" ? (
                        <p className="text-fg-muted">Digita un codice, anche parziale, per cercare.</p>
                    ) : (
                        <ReceiptResults
                            data={codeResults.data}
                            isLoading={codeResults.isLoading}
                            isError={codeResults.isError}
                            error={codeResults.error}
                            emptyMessage="Nessuna ricevuta corrisponde alla ricerca."
                        />
                    )}
                </>
            )}

            {mode === "amount" && (
                <>
                    <Card className="space-y-4">
                        <div className="flex flex-wrap gap-4 items-end">
                            <Field
                                id="amountMin"
                                label="Importo minimo (€)"
                                type="number"
                                step="0.01"
                                min="0"
                                value={amountMinInput}
                                onChange={(e) => setAmountMinInput(e.target.value)}
                            />
                            <Field
                                id="amountMax"
                                label="Importo massimo (€)"
                                type="number"
                                step="0.01"
                                min="0"
                                value={amountMaxInput}
                                onChange={(e) => setAmountMaxInput(e.target.value)}
                            />
                        </div>
                        {amountMinInput !== "" && amountMaxInput !== "" && !isAmountRangeValid && (
                            <p className="text-sm text-danger">L'importo massimo deve essere maggiore o uguale al minimo.</p>
                        )}
                    </Card>

                    {!isAmountRangeValid ? (
                        <p className="text-fg-muted">Inserisci un importo minimo e massimo per cercare.</p>
                    ) : (
                        <ReceiptResults
                            data={amountResults.data}
                            isLoading={amountResults.isLoading}
                            isError={amountResults.isError}
                            error={amountResults.error}
                            emptyMessage="Nessuna ricevuta corrisponde alla ricerca."
                        />
                    )}
                </>
            )}

            {mode === "card" && (
                <>
                    <Card className="space-y-2">
                        <Field
                            id="cardQuery"
                            label="Carta di pagamento"
                            value={cardQuery}
                            onChange={(e) => setCardQuery(e.target.value)}
                            placeholder="es. 4242 oppure il numero completo"
                        />
                        <p className="text-xs text-fg-muted">
                            Puoi digitare il numero intero: vengono usate solo le ultime quattro
                            cifre, le uniche che l'applicazione conserva.
                        </p>
                    </Card>

                    {cardLast4 === "" ? (
                        <p className="text-fg-muted">
                            Inserisci almeno le ultime quattro cifre della carta per cercare.
                        </p>
                    ) : (
                        <ReceiptResults
                            data={cardResults.data}
                            isLoading={cardResults.isLoading}
                            isError={cardResults.isError}
                            error={cardResults.error}
                            emptyMessage={`Nessuna ricevuta pagata con la carta •••• ${cardLast4}.`}
                        />
                    )}
                </>
            )}

            {mode === "email" && isAdmin && (
                <>
                    <Card className="space-y-4">
                        <Field
                            id="emailQuery"
                            label="Email utente"
                            type="email"
                            value={emailQuery}
                            onChange={(e) => setEmailQuery(e.target.value)}
                            placeholder="mario.rossi@email.com"
                        />
                        <ThresholdSlider id="emailThreshold" value={emailThreshold} onChange={setEmailThreshold} />
                    </Card>

                    {emailQuery.trim() === "" ? (
                        <p className="text-fg-muted">Digita un'email, anche parziale, per cercare.</p>
                    ) : (
                        <ReceiptResults
                            data={emailResults.data}
                            isLoading={emailResults.isLoading}
                            isError={emailResults.isError}
                            error={emailResults.error}
                            emptyMessage="Nessuna ricevuta corrisponde alla ricerca."
                        />
                    )}
                </>
            )}
        </PageContainer>
    );
}
