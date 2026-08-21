import { useState } from "react";
import type { ReceiptDTO } from "../../api/types";
import { useDeleteReceipt, useReceiptPdfUrl } from "./hooks";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { currencyFormatter, formatDate, paymentMethodLabels } from "./formatters";

export function ReceiptRow({ receipt }: { receipt: ReceiptDTO }) {
    const [expanded, setExpanded] = useState(false);
    const pdfUrl = useReceiptPdfUrl();
    const deleteReceipt = useDeleteReceipt();

    function handleDownload() {
        pdfUrl.mutate(receipt.code, {
            onSuccess: (url) => {
                if (!url) return;
                window.open(url, "_blank");
            },
        });
    }

    function handleDelete() {
        if (!window.confirm(`Eliminare la ricevuta "${receipt.code}"? L'operazione non è reversibile.`)) return;
        deleteReceipt.mutate(receipt.code);
    }

    return (
        <Card className="p-0 overflow-hidden">
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-slate-50 transition-colors"
            >
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{receipt.code}</p>
                    <p className="text-sm text-slate-500">{formatDate(receipt.date)}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="font-semibold text-slate-900">{currencyFormatter.format(Number(receipt.amount))}</p>
                    <p className="text-sm text-brand">{paymentMethodLabels[receipt.paymentMethod]}</p>
                </div>
            </button>

            {expanded && (
                <div className="border-t border-slate-200 p-4 space-y-3 bg-slate-50">
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
                                    <td className="py-1 text-slate-700">{line.productName}</td>
                                    <td className="py-1 text-slate-700">{line.productCode}</td>
                                    <td className="py-1 text-right text-slate-700">{line.quantity}</td>
                                    <td className="py-1 text-right text-slate-700">
                                        {currencyFormatter.format(Number(line.price))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={handleDownload}
                            disabled={pdfUrl.isPending}
                        >
                            {pdfUrl.isPending ? "Generazione..." : "Scarica PDF"}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            disabled={deleteReceipt.isPending}
                        >
                            {deleteReceipt.isPending ? "Eliminazione..." : "Elimina"}
                        </Button>
                    </div>
                    {pdfUrl.isError && (
                        <p className="text-sm text-red-600">
                            Errore: {(pdfUrl.error as Error).message}
                        </p>
                    )}
                    {deleteReceipt.isError && (
                        <p className="text-sm text-red-600">
                            Errore: {(deleteReceipt.error as Error).message}
                        </p>
                    )}
                </div>
            )}
        </Card>
    );
}
