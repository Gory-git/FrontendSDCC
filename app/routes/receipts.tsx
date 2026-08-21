import { useState } from "react";
import { useReceipts, useReceiptPdfUrl } from "../src/features/receipts/hooks";
import type { ReceiptDTO, PaymentMethod } from "../src/api/types";
import { ApiError } from "../src/api/client";

const paymentMethodLabels: Record<PaymentMethod, string> = {
    CASH: "Contanti",
    CREDIT_CARD: "Carta di credito",
    DEBIT_CARD: "Carta di debito",
    PAYPAL: "PayPal",
    BANK_TRANSFER: "Bonifico",
};

const currencyFormatter = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
});

function formatDate(iso: string): string {
    return new Intl.DateTimeFormat("it-IT", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(iso));
}

function ReceiptRow({ receipt }: { receipt: ReceiptDTO }) {
    const [expanded, setExpanded] = useState(false);
    const pdfUrl = useReceiptPdfUrl();

    function handleDownload() {
        pdfUrl.mutate(receipt.code, {
            onSuccess: (url) => window.open(url, "_blank"),
        });
    }

    return (
        <div className="rounded-xl border">
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between gap-4 p-4 text-left"
            >
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{receipt.code}</p>
                    <p className="text-sm text-slate-500">{formatDate(receipt.date)}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="font-semibold">{currencyFormatter.format(Number(receipt.amount))}</p>
                    <p className="text-sm text-slate-500">{paymentMethodLabels[receipt.paymentMethod]}</p>
                </div>
            </button>

            {expanded && (
                <div className="border-t p-4 space-y-3">
                    <p className="text-sm text-slate-500">
                        Tasse: {currencyFormatter.format(Number(receipt.tax))}
                    </p>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500">
                                <th className="pb-1">Prodotto</th>
                                <th className="pb-1">Codice</th>
                                <th className="pb-1 text-right">Qtà</th>
                                <th className="pb-1 text-right">Prezzo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipt.lines.map((line) => (
                                <tr key={line.productCode}>
                                    <td className="py-1">{line.productName}</td>
                                    <td className="py-1">{line.productCode}</td>
                                    <td className="py-1 text-right">{line.quantity}</td>
                                    <td className="py-1 text-right">
                                        {currencyFormatter.format(Number(line.price))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button
                        onClick={handleDownload}
                        disabled={pdfUrl.isPending}
                        className="rounded bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200 disabled:opacity-50"
                    >
                        {pdfUrl.isPending ? "Generazione..." : "Scarica PDF"}
                    </button>
                    {pdfUrl.isError && (
                        <p className="text-sm text-red-600">
                            Errore: {(pdfUrl.error as Error).message}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ReceiptsPage() {
    const [sortByDate, setSortByDate] = useState(true);
    const { data, isLoading, isError, error } = useReceipts(sortByDate);

    return (
        <main className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Ricevute</h1>
                <div className="flex gap-1 rounded-lg border p-1">
                    <button
                        onClick={() => setSortByDate(true)}
                        className={`px-3 py-1.5 rounded text-sm font-medium ${
                            sortByDate ? "bg-slate-900 text-white" : "text-slate-600"
                        }`}
                    >
                        Ordina per data
                    </button>
                    <button
                        onClick={() => setSortByDate(false)}
                        className={`px-3 py-1.5 rounded text-sm font-medium ${
                            !sortByDate ? "bg-slate-900 text-white" : "text-slate-600"
                        }`}
                    >
                        Ordina per importo
                    </button>
                </div>
            </div>

            {isLoading && <p>Caricamento ricevute...</p>}
            {isError && (error instanceof ApiError && error.status === 404 ? (
                <p className="text-slate-500">Nessuna ricevuta trovata.</p>
            ) : (
                <p className="text-red-600">Errore: {(error as Error).message}</p>
            ))}
            {!isLoading && !isError && data?.length === 0 && (
                <p className="text-slate-500">Nessuna ricevuta trovata.</p>
            )}

            <div className="space-y-3">
                {data?.map((receipt) => (
                    <ReceiptRow key={receipt.code} receipt={receipt} />
                ))}
            </div>
        </main>
    );
}
