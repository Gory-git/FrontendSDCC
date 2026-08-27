import { useTheme } from "../theme/ThemeProvider";
import { Button } from "./Button";

/**
 * Quale icona mostrare lo decide il CSS (`dark:`), non lo stato React: il
 * server non conosce il tema del client e un'icona scelta in JS produrrebbe
 * un mismatch di idratazione a ogni caricamento.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
    const { toggle } = useTheme();

    return (
        <Button
            variant="ghost"
            onClick={toggle}
            aria-label="Cambia tema chiaro/scuro"
            title="Cambia tema chiaro/scuro"
            className={`px-2 py-1.5 ${className}`}
        >
            <svg className="w-5 h-5 dark:hidden" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
            <svg className="w-5 h-5 hidden dark:block" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
        </Button>
    );
}
