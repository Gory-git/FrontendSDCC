import { useState } from "react";
import { useNavigate } from "react-router";
import { useCurrentUser } from "../src/features/user/hooks";
import { useAllProducts } from "../src/features/products/hooks";
import { useAddReceipt, useUploadReceiptPdf } from "../src/features/receipts/hooks";
import type { PaymentMethod, ReceiptDTO } from "../src/api/types";
import { isPlausibleCard, lastFourDigits } from "../src/lib/card";
import { PageContainer } from "../src/components/PageContainer";
import { Loading, ReceiptSpinner } from "../src/components/Loading";
import { errorMessage } from "../src/lib/errorMessage";
import { ApiError } from "../src/api/client";
import { Card } from "../src/components/Card";
import { Field } from "../src/components/Field";
import { DateField } from "../src/components/DateField";
import { Button } from "../src/components/Button";
import { APP_MIN_DATETIME_LOCAL, nowForDatetimeLocal } from "../src/lib/dateInput";

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
    { value: "CASH", label: "Contanti" },
    { value: "CREDIT_CARD", label: "Carta di credito" },
    { value: "DEBIT_CARD", label: "Carta di debito" },
    { value: "PAYPAL", label: "PayPal" },
    { value: "BANK_TRANSFER", label: "Bonifico" },
];

const currencyFormatter = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
});

const inputClass =
    "border border-line-strong rounded-lg p-2 text-sm bg-card focus:border-brand focus:ring-2 focus:ring-brand-ring outline-none";

type LineForm = {
    productCode: string;
    quantity: string;
    price: string;
};

function ManualReceiptForm() {
    const navigate = useNavigate();
    const { data: currentUser } = useCurrentUser();
    const { data: products, isLoading: productsLoading } = useAllProducts();
    const addReceipt = useAddReceipt();

    const [code, setCode] = useState<string>(() => crypto.randomUUID());
    const [date, setDate] = useState(nowForDatetimeLocal);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
    const [card, setCard] = useState("");
    // La carta si chiede solo dove ha senso: il backend rifiuta una ricevuta
    // in contanti con un numero di carta allegato.
    const pagaConCarta = paymentMethod === "CREDIT_CARD" || paymentMethod === "DEBIT_CARD";
    const cartaNonValida = pagaConCarta && card.trim() !== "" && !isPlausibleCard(card);
    const [tax, setTax] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [lines, setLines] = useState<LineForm[]>([{ productCode: "", quantity: "1", price: "" }]);

    const isAdmin = currentUser?.role === "ROLE_ADMIN";
    const effectiveUserEmail = isAdmin ? userEmail || currentUser?.email || "" : currentUser?.email ?? "";

    // I prezzi dei prodotti sono tasse escluse: il totale della ricevuta è
    // subtotale (somma prezzo × quantità delle righe) + tasse.
    const subtotal = lines.reduce((sum, line) => {
        const qty = Number(line.quantity);
        const price = Number(line.price);
        return Number.isFinite(qty) && Number.isFinite(price) ? sum + qty * price : sum;
    }, 0);

    const taxValue = Number(tax);
    const hasValidLines = lines.length > 0 && lines.every(
        (l) => l.productCode && Number(l.quantity) > 0 && Number(l.price) > 0
    );
    const isTaxValid = tax !== "" && Number.isFinite(taxValue) && taxValue > 0;
    const amount = subtotal + (isTaxValid ? taxValue : 0);
    const canSubmit = hasValidLines && subtotal > 0 && isTaxValid && !!effectiveUserEmail && !cartaNonValida && !addReceipt.isPending;

    function updateLine(index: number, patch: Partial<LineForm>) {
        setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
    }

    function addLine() {
        setLines((prev) => [...prev, { productCode: "", quantity: "1", price: "" }]);
    }

    function removeLine(index: number) {
        setLines((prev) => prev.filter((_, i) => i !== index));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit) return;

        const dto: ReceiptDTO = {
            code,
            amount,
            tax: taxValue,
            date: new Date(date).toISOString(),
            paymentMethod,
            // Solo le ultime quattro cifre lasciano il browser, e nulla parte se
            // il metodo di pagamento non e' una carta.
            cardLast4: pagaConCarta ? lastFourDigits(card) || undefined : undefined,
            userEmail: effectiveUserEmail,
            lines: lines.map((l) => ({
                productCode: l.productCode,
                productName: products?.find((p) => p.code === l.productCode)?.name ?? "",
                quantity: Number(l.quantity),
                price: Number(l.price),
            })),
        };

        addReceipt.mutate(dto, {
            onSuccess: () => navigate("/receipts"),
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="grid grid-cols-2 gap-4">
                <Field id="code" label="Codice ricevuta" value={code} onChange={(e) => setCode(e.target.value)} required />

                <DateField
                    id="date"
                    label="Data"
                    type="datetime-local"
                    value={date}
                    min={APP_MIN_DATETIME_LOCAL}
                    max={nowForDatetimeLocal()}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />

                <div className="flex flex-col gap-1">
                    <label htmlFor="paymentMethod" className="text-sm font-semibold text-fg-secondary">Metodo di pagamento</label>
                    <select
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className={inputClass}
                    >
                        {paymentMethodOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {pagaConCarta && (
                    <div>
                        <Field
                            id="card"
                            label="Carta (facoltativo)"
                            value={card}
                            onChange={(e) => setCard(e.target.value)}
                            placeholder="numero completo o ultime 4 cifre"
                            error={cartaNonValida ? "Numero di carta non valido." : undefined}
                        />
                        <p className="text-xs text-fg-muted mt-1">
                            Vengono salvate solo le ultime quattro cifre.
                        </p>
                    </div>
                )}

                <div>
                    <Field
                        id="tax"
                        label="Tasse (€)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={tax}
                        onChange={(e) => setTax(e.target.value)}
                        required
                        error={tax !== "" && !isTaxValid ? "Deve essere maggiore di zero." : undefined}
                    />
                </div>

                {isAdmin && (
                    <div className="col-span-2">
                        <Field
                            id="userEmail"
                            label="Email cliente"
                            type="email"
                            value={effectiveUserEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            required
                        />
                    </div>
                )}
            </Card>

            <Card className="space-y-3">
                <h2 className="text-lg font-semibold text-fg">Prodotti acquistati</h2>

                {productsLoading && <Loading label="Caricamento prodotti..." />}
                {!productsLoading && (products?.length ?? 0) === 0 && (
                    <p className="text-sm text-fg-muted">
                        Nessun prodotto disponibile. Contatta un amministratore per aggiungerne.
                    </p>
                )}

                {lines.map((line, index) => (
                    <div key={index} className="flex gap-2 items-end">
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-xs text-fg-muted">Prodotto</label>
                            <select
                                value={line.productCode}
                                onChange={(e) => updateLine(index, { productCode: e.target.value })}
                                className={inputClass}
                                required
                            >
                                <option value="" disabled>Seleziona un prodotto</option>
                                {products?.map((p) => (
                                    <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1 w-24">
                            <label className="text-xs text-fg-muted">Quantità</label>
                            <input
                                type="number"
                                min="1"
                                value={line.quantity}
                                onChange={(e) => updateLine(index, { quantity: e.target.value })}
                                className={inputClass}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1 w-28">
                            <label className="text-xs text-fg-muted">Prezzo (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={line.price}
                                onChange={(e) => updateLine(index, { price: e.target.value })}
                                className={inputClass}
                                required
                            />
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => removeLine(index)}
                            disabled={lines.length === 1}
                        >
                            Rimuovi
                        </Button>
                    </div>
                ))}

                <Button type="button" variant="secondary" onClick={addLine}>
                    Aggiungi riga
                </Button>
            </Card>

            <Card className="space-y-1">
                <div className="flex items-center justify-between text-sm text-fg-muted">
                    <span>Subtotale (tasse escluse)</span>
                    <span>{currencyFormatter.format(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-fg-muted">
                    <span>Tasse</span>
                    <span>{currencyFormatter.format(isTaxValid ? taxValue : 0)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-line">
                    <span className="font-semibold text-fg-secondary">Importo totale</span>
                    <span className="text-lg font-bold text-fg">{currencyFormatter.format(amount)}</span>
                </div>
            </Card>

            {addReceipt.isError && (
                <p className="text-sm text-danger">{receiptConflictMessage(addReceipt.error, "Non è stato possibile salvare la ricevuta.")}</p>
            )}

            <Button type="submit" disabled={!canSubmit}>
                {addReceipt.isPending ? <><ReceiptSpinner size="sm" />Salvataggio...</> : "Salva ricevuta"}
            </Button>
        </form>
    );
}

function PdfUploadForm() {
    const navigate = useNavigate();
    const uploadPdf = useUploadReceiptPdf();
    const [file, setFile] = useState<File | null>(null);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file) return;
        uploadPdf.mutate(file, {
            onSuccess: () => navigate("/receipts"),
        });
    }

    return (
        <Card>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <p className="text-sm text-fg-muted">
                    Il PDF deve essere uno scontrino generato dal sistema (ad esempio scaricato dalla
                    pagina "Ricevute"): non è possibile caricare un PDF qualsiasi.
                </p>
                <div className="flex flex-col gap-1">
                    <label htmlFor="pdf" className="text-sm font-semibold text-fg-secondary">File PDF</label>
                    <input
                        id="pdf"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className={inputClass}
                        required
                    />
                </div>

                {uploadPdf.isError && (
                    <p className="text-sm text-danger">{receiptConflictMessage(uploadPdf.error, "Non è stato possibile caricare il PDF.")}</p>
                )}

                <Button type="submit" disabled={!file || uploadPdf.isPending}>
                    {uploadPdf.isPending ? <><ReceiptSpinner size="sm" />Caricamento...</> : "Carica PDF"}
                </Button>
            </form>
        </Card>
    );
}

/**
 * Il 409 generico ("dati già associati a un altro elemento") non dice cosa sia
 * duplicato. Qui l'unica causa possibile è il codice della ricevuta, e vale la
 * pena dirlo: è l'informazione che serve per capire cosa fare.
 */
function receiptConflictMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError && error.status === 409)
        return "Esiste già una ricevuta con questo codice.";
    return errorMessage(error, fallback);
}

export default function NewReceiptPage() {
    const [mode, setMode] = useState<"manual" | "pdf">("manual");

    return (
        <PageContainer className="max-w-2xl">
            <h1 className="text-2xl font-bold text-fg">Nuova ricevuta</h1>

            <div className="flex gap-1 rounded-lg border border-line bg-card p-1 w-fit">
                <button
                    onClick={() => setMode("manual")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        mode === "manual" ? "bg-brand text-white" : "text-fg-muted hover:bg-muted"
                    }`}
                >
                    Inserimento manuale
                </button>
                <button
                    onClick={() => setMode("pdf")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        mode === "pdf" ? "bg-brand text-white" : "text-fg-muted hover:bg-muted"
                    }`}
                >
                    Carica PDF
                </button>
            </div>

            {mode === "manual" ? <ManualReceiptForm /> : <PdfUploadForm />}
        </PageContainer>
    );
}
