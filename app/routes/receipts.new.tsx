import { useState } from "react";
import { useNavigate } from "react-router";
import { useCurrentUser } from "../src/features/user/hooks";
import { useAllProducts } from "../src/features/products/hooks";
import { useAddReceipt, useUploadReceiptPdf } from "../src/features/receipts/hooks";
import type { PaymentMethod, ReceiptDTO } from "../src/api/types";

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

type LineForm = {
    productCode: string;
    quantity: string;
    price: string;
};

function nowForDatetimeLocal(): string {
    const now = new Date();
    now.setSeconds(0, 0);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
}

function ManualReceiptForm() {
    const navigate = useNavigate();
    const { data: currentUser } = useCurrentUser();
    const { data: products, isLoading: productsLoading } = useAllProducts();
    const addReceipt = useAddReceipt();

    const [code, setCode] = useState<string>(() => crypto.randomUUID());
    const [date, setDate] = useState(nowForDatetimeLocal);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
    const [tax, setTax] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [lines, setLines] = useState<LineForm[]>([{ productCode: "", quantity: "1", price: "" }]);

    const isAdmin = currentUser?.role === "ROLE_ADMIN";
    const effectiveUserEmail = isAdmin ? userEmail || currentUser?.email || "" : currentUser?.email ?? "";

    const amount = lines.reduce((sum, line) => {
        const qty = Number(line.quantity);
        const price = Number(line.price);
        return Number.isFinite(qty) && Number.isFinite(price) ? sum + qty * price : sum;
    }, 0);

    const taxValue = Number(tax);
    const hasValidLines = lines.length > 0 && lines.every(
        (l) => l.productCode && Number(l.quantity) > 0 && Number(l.price) > 0
    );
    const isTaxValid = tax !== "" && Number.isFinite(taxValue) && taxValue > 0 && taxValue < amount;
    const canSubmit = hasValidLines && amount > 0 && isTaxValid && !!effectiveUserEmail && !addReceipt.isPending;

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
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label htmlFor="code" className="text-sm font-semibold">Codice ricevuta</label>
                    <input
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="border rounded p-2"
                        required
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="date" className="text-sm font-semibold">Data</label>
                    <input
                        id="date"
                        type="datetime-local"
                        value={date}
                        max={nowForDatetimeLocal()}
                        onChange={(e) => setDate(e.target.value)}
                        className="border rounded p-2"
                        required
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="paymentMethod" className="text-sm font-semibold">Metodo di pagamento</label>
                    <select
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="border rounded p-2"
                    >
                        {paymentMethodOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="tax" className="text-sm font-semibold">Tasse (€)</label>
                    <input
                        id="tax"
                        type="number"
                        step="0.01"
                        min="0"
                        value={tax}
                        onChange={(e) => setTax(e.target.value)}
                        className="border rounded p-2"
                        required
                    />
                    {tax !== "" && !isTaxValid && (
                        <p className="text-xs text-red-600">
                            Le tasse devono essere maggiori di zero e inferiori all'importo totale.
                        </p>
                    )}
                </div>
                {isAdmin && (
                    <div className="flex flex-col gap-1 col-span-2">
                        <label htmlFor="userEmail" className="text-sm font-semibold">Email cliente</label>
                        <input
                            id="userEmail"
                            type="email"
                            value={effectiveUserEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            className="border rounded p-2"
                            required
                        />
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <h2 className="text-lg font-semibold">Prodotti acquistati</h2>

                {productsLoading && <p className="text-sm text-slate-500">Caricamento prodotti...</p>}
                {!productsLoading && (products?.length ?? 0) === 0 && (
                    <p className="text-sm text-slate-500">
                        Nessun prodotto disponibile. Contatta un amministratore per aggiungerne.
                    </p>
                )}

                {lines.map((line, index) => (
                    <div key={index} className="flex gap-2 items-end">
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-xs text-slate-500">Prodotto</label>
                            <select
                                value={line.productCode}
                                onChange={(e) => updateLine(index, { productCode: e.target.value })}
                                className="border rounded p-2"
                                required
                            >
                                <option value="" disabled>Seleziona un prodotto</option>
                                {products?.map((p) => (
                                    <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1 w-24">
                            <label className="text-xs text-slate-500">Quantità</label>
                            <input
                                type="number"
                                min="1"
                                value={line.quantity}
                                onChange={(e) => updateLine(index, { quantity: e.target.value })}
                                className="border rounded p-2"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1 w-28">
                            <label className="text-xs text-slate-500">Prezzo (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={line.price}
                                onChange={(e) => updateLine(index, { price: e.target.value })}
                                className="border rounded p-2"
                                required
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeLine(index)}
                            disabled={lines.length === 1}
                            className="rounded border px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                        >
                            Rimuovi
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addLine}
                    className="rounded bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200"
                >
                    Aggiungi riga
                </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-4">
                <span className="font-semibold">Importo totale</span>
                <span className="text-lg font-bold">{currencyFormatter.format(amount)}</span>
            </div>

            {addReceipt.isError && (
                <p className="text-sm text-red-600">Errore: {(addReceipt.error as Error).message}</p>
            )}

            <button
                type="submit"
                disabled={!canSubmit}
                className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
            >
                {addReceipt.isPending ? "Salvataggio..." : "Salva ricevuta"}
            </button>
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
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <p className="text-sm text-slate-500">
                Il PDF deve essere uno scontrino generato dal sistema (ad esempio scaricato dalla
                pagina "Ricevute"): non è possibile caricare un PDF qualsiasi.
            </p>
            <div className="flex flex-col gap-1">
                <label htmlFor="pdf" className="text-sm font-semibold">File PDF</label>
                <input
                    id="pdf"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="border rounded p-2"
                    required
                />
            </div>

            {uploadPdf.isError && (
                <p className="text-sm text-red-600">Errore: {(uploadPdf.error as Error).message}</p>
            )}

            <button
                type="submit"
                disabled={!file || uploadPdf.isPending}
                className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
            >
                {uploadPdf.isPending ? "Caricamento..." : "Carica PDF"}
            </button>
        </form>
    );
}

export default function NewReceiptPage() {
    const [mode, setMode] = useState<"manual" | "pdf">("manual");

    return (
        <main className="p-6 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Nuova ricevuta</h1>

            <div className="flex gap-1 rounded-lg border p-1 w-fit">
                <button
                    onClick={() => setMode("manual")}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${
                        mode === "manual" ? "bg-slate-900 text-white" : "text-slate-600"
                    }`}
                >
                    Inserimento manuale
                </button>
                <button
                    onClick={() => setMode("pdf")}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${
                        mode === "pdf" ? "bg-slate-900 text-white" : "text-slate-600"
                    }`}
                >
                    Carica PDF
                </button>
            </div>

            {mode === "manual" ? <ManualReceiptForm /> : <PdfUploadForm />}
        </main>
    );
}
