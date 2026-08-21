export function PageContainer({ className = "", ...props }: React.HTMLAttributes<HTMLElement>) {
    return (
        <main
            className={`max-w-4xl mx-auto px-6 py-8 space-y-6 ${className}`}
            {...props}
        />
    );
}
