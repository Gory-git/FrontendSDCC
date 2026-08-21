export interface DateFieldProps {
    id:        string;
    label:     string;
    value:     string;
    onChange:  (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?:     "date" | "datetime-local";
    min?:      string;
    max?:      string;
    required?: boolean;
    error?:    string;
}

export function DateField({ id, label, value, onChange, type = "date", min, max, required, error }: DateFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-semibold text-slate-700">
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                required={required}
                aria-invalid={!!error}
                // Forza i controlli nativi (icona calendario inclusa) al tema chiaro:
                // se il sistema è in dark mode altrimenti l'icona nasce bianca su
                // sfondo bianco e diventa invisibile.
                style={{ colorScheme: "light" }}
                className={[
                    "rounded-lg border px-3 py-2.5 text-sm bg-white outline-none",
                    "transition-all duration-150 focus:ring-2 focus:ring-offset-1",
                    error
                        ? "border-red-400 focus:ring-red-300"
                        : "border-slate-300 focus:border-brand focus:ring-indigo-200",
                ].join(" ")}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}
