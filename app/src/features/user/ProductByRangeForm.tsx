import { useState } from "react";
import { useProductOfTimeSpan } from "./hooks";
import { ProductCard } from "./ProductCard";

export function ProductByRangeForm() {
    const [dateMinInput, setDateMinInput] = useState("");
    const [dateMaxInput, setDateMaxInput] = useState("");
    const [submittedRange, setSubmittedRange] = useState<{
        dateMin?: string;
        dateMax?: string;
    }>({});

    const { data, isLoading, isError, error } = useProductOfTimeSpan(
        submittedRange.dateMin,
        submittedRange.dateMax
    );

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!dateMinInput || !dateMaxInput) return;

        setSubmittedRange({
            dateMin: new Date(`${dateMinInput}T00:00:00Z`).toISOString(),
            dateMax: new Date(`${dateMaxInput}T23:59:59Z`).toISOString(),
        });
    }

    return (
        <div className="rounded-xl border p-4 space-y-4">
            <h2 className="text-xl font-semibold">Prodotto per intervallo</h2>

            <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                <div className="flex flex-col">
                    <label htmlFor="dateMin">Data iniziale</label>
                    <input
                        id="dateMin"
                        type="date"
                        value={dateMinInput}
                        onChange={(e) => setDateMinInput(e.target.value)}
                        className="border p-2 rounded"
                    />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="dateMax">Data finale</label>
                    <input
                        id="dateMax"
                        type="date"
                        value={dateMaxInput}
                        onChange={(e) => setDateMaxInput(e.target.value)}
                        className="border p-2 rounded"
                    />
                </div>

                <button
                    type="submit"
                    className="rounded bg-black text-white px-4 py-2"
                >
                    Cerca
                </button>
            </form>

            {isLoading && <p>Caricamento...</p>}
            {isError && <p>Errore: {(error as Error).message}</p>}
            {data && <ProductCard title="Prodotto trovato" product={data} />}
        </div>
    );
}
