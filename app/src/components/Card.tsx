export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`rounded-2xl border border-slate-200 bg-white shadow-sm p-6 ${className}`}
            {...props}
        />
    );
}
