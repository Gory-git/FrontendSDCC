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
            <label htmlFor={id} className="text-sm font-semibold text-fg-secondary">
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
                className={[
                    "rounded-lg border px-3 py-2.5 text-sm bg-card outline-none",
                    "transition-all duration-150 focus:ring-2 focus:ring-offset-1 ring-offset-card",
                    error
                        ? "border-danger-line focus:ring-danger-line"
                        : "border-line-strong focus:border-brand focus:ring-brand-ring",
                ].join(" ")}
            />
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
}
