import { useState } from "react";
import { useProductOfTimeSpan } from "./hooks";
import { ProductCard } from "./ProductCard";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { DateField } from "../../components/DateField";
import { APP_MIN_DATE, daysAgoDateString, endOfDayIsoClamped, startOfDayIso, todayDateString } from "../../lib/dateInput";

export function ProductByRangeForm() {
    const [dateMinInput, setDateMinInput] = useState(() => daysAgoDateString(30));
    const [dateMaxInput, setDateMaxInput] = useState(todayDateString);
    const [submittedRange, setSubmittedRange] = useState<{ dateMin?: string; dateMax?: string }>(() => ({
        dateMin: startOfDayIso(daysAgoDateString(30)),
        dateMax: endOfDayIsoClamped(todayDateString()),
    }));

    const { data, isLoading, isError, error } = useProductOfTimeSpan(
        submittedRange.dateMin,
        submittedRange.dateMax
    );

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!dateMinInput || !dateMaxInput) return;

        setSubmittedRange({
            dateMin: startOfDayIso(dateMinInput),
            dateMax: endOfDayIsoClamped(dateMaxInput),
        });
    }

    return (
        <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Prodotto per intervallo</h2>

            <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                <DateField
                    id="dateMin"
                    label="Data iniziale"
                    value={dateMinInput}
                    onChange={(e) => setDateMinInput(e.target.value)}
                    min={APP_MIN_DATE}
                    max={dateMaxInput || todayDateString()}
                />
                <DateField
                    id="dateMax"
                    label="Data finale"
                    value={dateMaxInput}
                    onChange={(e) => setDateMaxInput(e.target.value)}
                    min={dateMinInput || APP_MIN_DATE}
                    max={todayDateString()}
                />

                <Button type="submit" variant="primary">Cerca</Button>
            </form>

            {isLoading && <p className="text-sm text-slate-500">Caricamento...</p>}
            {isError && <p className="text-sm text-slate-500">Errore: {(error as Error).message}</p>}
            {data && <ProductCard title="Prodotto trovato" product={data} />}
        </Card>
    );
}
