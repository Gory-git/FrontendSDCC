export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`rounded-2xl border border-line bg-card shadow-sm p-6 ${className}`}
            {...props}
        />
    );
}
