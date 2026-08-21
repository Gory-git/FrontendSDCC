import { useState } from "react";
import { useReceipts, useReceiptsByCode, useReceiptsByUserEmail } from "../src/features/receipts/hooks";
import { useCurrentUser } from "../src/features/user/hooks";
import { ApiError } from "../src/api/client";
import { PageContainer } from "../src/components/PageContainer";
import { Card } from "../src/components/Card";
import { Field } from "../src/components/Field";
import { ThresholdSlider } from "../src/components/ThresholdSlider";
import { ReceiptRow } from "../src/features/receipts/ReceiptRow";
import type { ReceiptDTO } from "../src/api/types";

type Mode = "all" | "code" | "email";

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
            {isLoading && <p className="text-slate-500">Caricamento...</p>}
            {isError && (error instanceof ApiError && error.status === 404 ? (
                <p className="text-slate-500">{emptyMessage}</p>
            ) : (
                <p className="text-red-600">Errore: {(error as Error).message}</p>
            ))}
            {!isLoading && !isError && data?.length === 0 && (
                <p className="text-slate-500">{emptyMessage}</p>
            )}

            <div className="space-y-3">
                {data?.map((receipt) => (
                    <ReceiptRow key={receipt.code} receipt={receipt} />
                ))}
            </div>
        </>
    );
}

export default function ReceiptsPage() {
    const { data: currentUser } = useCurrentUser();
    const isAdmin = currentUser?.role === "ROLE_ADMIN";

    const [mode, setMode] = useState<Mode>("all");
    const [sortByDate, setSortByDate] = useState(true);

    const [codeQuery, setCodeQuery] = useState("");
    const [codeThreshold, setCodeThreshold] = useState(0.5);

    const [emailQuery, setEmailQuery] = useState("");
    const [emailThreshold, setEmailThreshold] = useState(0.5);

    const allReceipts = useReceipts(sortByDate, mode === "all");
    const codeResults = useReceiptsByCode(codeQuery.trim(), codeThreshold, mode === "code");
    const emailResults = useReceiptsByUserEmail(emailQuery.trim(), emailThreshold, mode === "email" && isAdmin);

    return (
        <PageContainer>
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-2xl font-bold text-slate-900">Ricevute</h1>
                <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
                    <button
                        onClick={() => setMode("all")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            mode === "all" ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        Tutte
                    </button>
                    <button
                        onClick={() => setMode("code")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            mode === "code" ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        Cerca per codice
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setMode("email")}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                mode === "email" ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            Cerca per email utente
                        </button>
                    )}
                </div>
            </div>

            {mode === "all" && (
                <>
                    <div className="flex justify-end">
                        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
                            <button
                                onClick={() => setSortByDate(true)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    sortByDate ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                Ordina per data
                            </button>
                            <button
                                onClick={() => setSortByDate(false)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    !sortByDate ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                Ordina per importo
                            </button>
                        </div>
                    </div>

                    <ReceiptResults
                        data={allReceipts.data}
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
                        <p className="text-slate-500">Digita un codice, anche parziale, per cercare.</p>
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
                        <p className="text-slate-500">Digita un'email, anche parziale, per cercare.</p>
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
