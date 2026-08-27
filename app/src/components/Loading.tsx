/**
 * Indicatore di caricamento dell'app: una ricevuta che si gira su se stessa.
 * Disegnata in SVG e non con l'emoji 🧾 perché l'emoji ha colori propri (non
 * seguirebbe il tema scuro) e viene resa dal font di sistema, quindi cambia
 * forma tra Windows, macOS e Android. Qui il tratto è `currentColor`, quindi
 * eredita il colore del testo del contesto in cui viene messa.
 */

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
};

export function ReceiptSpinner({ size = "md", className = "" }: { size?: Size; className?: string }) {
    return (
        // La prospettiva sul contenitore dà profondità alla rotazione: senza,
        // il foglio si schiaccia in una linea invece di girare.
        <span className={`inline-block shrink-0 ${SIZES[size]} ${className}`} style={{ perspective: "60px" }}>
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full animate-receipt-flip"
                aria-hidden="true"
            >
                <path d="M5 2h14v19l-2.33-1.6-2.33 1.6-2.34-1.6-2.33 1.6-2.33-1.6L5 21z" />
                <path d="M8.5 7.5h7" opacity={0.55} />
                <path d="M8.5 11h7" opacity={0.55} />
                <path d="M8.5 14.5h4" opacity={0.55} />
            </svg>
        </span>
    );
}

export function Loading({
    label = "Caricamento...",
    size = "md",
    className = "",
}: {
    label?: string;
    size?: Size;
    className?: string;
}) {
    return (
        <div role="status" className={`flex items-center gap-3 text-fg-muted ${className}`}>
            <ReceiptSpinner size={size} />
            <span className="text-sm">{label}</span>
        </div>
    );
}
