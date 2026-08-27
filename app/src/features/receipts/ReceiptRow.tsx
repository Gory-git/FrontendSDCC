import { useState } from "react";
import { Link } from "react-router";
import type { ReceiptDTO } from "../../api/types";
import { useDeleteReceipt, useReceiptPdfUrl } from "./hooks";
import { useCurrentUser } from "../user/hooks";
import { Card } from "../../components/Card";
import { errorMessage } from "../../lib/errorMessage";
import { Button } from "../../components/Button";
import { ReceiptSpinner } from "../../components/Loading";
import { currencyFormatter, formatDate, paymentMethodLabels } from "./formatters";

export function ReceiptRow({ receipt }: { receipt: ReceiptDTO }) {
    const [expanded, setExpanded] = useState(false);
    const pdfUrl = useReceiptPdfUrl();
    // La query è la stessa che usa la navbar: TanStack la serve dalla cache,
    // quindi averla in ogni riga non moltiplica le richieste.
    const { data: currentUser } = useCurrentUser();
    const isAdmin = currentUser?.role === "ROLE_ADMIN";
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
                className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-muted transition-colors"
            >
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-fg truncate">{receipt.code}</p>
                    <p className="text-sm text-fg-muted">{formatDate(receipt.date)}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="font-semibold text-fg">{currencyFormatter.format(Number(receipt.amount))}</p>
                    <p className="text-sm text-brand-fg">{paymentMethodLabels[receipt.paymentMethod]}</p>
                </div>
            </button>

            {expanded && (
                <div className="border-t border-line p-4 space-y-3 bg-muted">
                    {/* Solo per l'admin: nella pagina delle proprie ricevute vedere
                        la propria email a ogni riga sarebbe rumore. */}
                    {isAdmin && (
                        <p className="text-sm text-fg-muted">
                            Intestatario:{" "}
                            <Link
                                to={`/admin/users/${encodeURIComponent(receipt.userEmail)}`}
                                className="font-medium text-brand-fg hover:text-brand-hover"
                            >
                                {receipt.userEmail}
                            </Link>
                        </p>
                    )}
                    <p className="text-sm text-fg-muted">
                        Tasse: {currencyFormatter.format(Number(receipt.tax))}
                    </p>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-fg-muted">
                                <th className="pb-1">Prodotto</th>
                                <th className="pb-1">Codice</th>
                                <th className="pb-1 text-right">Qtà</th>
                                <th className="pb-1 text-right">Prezzo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipt.lines.map((line) => (
                                <tr key={line.productCode}>
                                    <td className="py-1 text-fg-secondary">{line.productName}</td>
                                    <td className="py-1 text-fg-secondary">{line.productCode}</td>
                                    <td className="py-1 text-right text-fg-secondary">{line.quantity}</td>
                                    <td className="py-1 text-right text-fg-secondary">
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
                            {pdfUrl.isPending ? <><ReceiptSpinner size="sm" />Generazione...</> : "Scarica PDF"}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            disabled={deleteReceipt.isPending}
                        >
                            {deleteReceipt.isPending ? <><ReceiptSpinner size="sm" />Eliminazione...</> : "Elimina"}
                        </Button>
                    </div>
                    {pdfUrl.isError && (
                        <p className="text-sm text-danger">
                            {errorMessage(pdfUrl.error, "Non è stato possibile aprire il PDF della ricevuta.")}
                        </p>
                    )}
                    {deleteReceipt.isError && (
                        <p className="text-sm text-danger">
                            {errorMessage(deleteReceipt.error, "Non è stato possibile eliminare la ricevuta.")}
                        </p>
                    )}
                </div>
            )}
        </Card>
    );
}
