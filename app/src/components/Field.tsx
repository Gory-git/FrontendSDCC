export interface FieldProps {
    id:           string;
    label:        string;
    type?:        string;
    value:        string;
    error?:       string;
    placeholder?: string;
    required?:    boolean;
    min?:         string | number;
    step?:        string | number;
    max?:         string | number;
    onChange:     (e: React.ChangeEvent<HTMLInputElement>) => void;
    rightSlot?:   React.ReactNode;
}

export function Field({
    id, label, type = "text", value, error, placeholder, required, min, step, max, onChange, rightSlot,
}: FieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-semibold text-slate-700">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    name={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    min={min}
                    step={step}
                    max={max}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={[
                        "w-full rounded-lg border px-3 py-2.5 text-sm bg-white",
                        "text-slate-900 placeholder-slate-400 outline-none",
                        "transition-all duration-150 focus:ring-2 focus:ring-offset-1",
                        rightSlot ? "pr-10" : "",
                        error
                            ? "border-red-400 focus:ring-red-300"
                            : "border-slate-300 focus:border-brand focus:ring-indigo-200",
                    ].join(" ")}
                />
                {rightSlot && (
                    <div className="absolute inset-y-0 right-3 flex items-center">
                        {rightSlot}
                    </div>
                )}
            </div>
            {error && (
                <p id={`${id}-error`} className="text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
