import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

/**
 * Script sincrono da iniettare nell'`<head>`: applica il tema prima del primo
 * paint, altrimenti in SSR la pagina nasce chiara e lampeggia quando React
 * idrata. Tenuto qui accanto al provider perché le due parti devono restare
 * d'accordo sulla chiave di localStorage e sul nome della classe.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.style.colorScheme=t;}catch(e){}})();`;

type ThemeContextValue = {
    theme: Theme;
    toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
    theme: "light",
    toggle: () => {},
});

function applyTheme(theme: Theme) {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
}

function currentTheme(): Theme {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(currentTheme);

    // Finché l'utente non sceglie esplicitamente, il tema resta agganciato a
    // quello di sistema anche se cambia mentre l'app è aperta.
    useEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => {
            if (localStorage.getItem(THEME_STORAGE_KEY)) return;
            const next: Theme = media.matches ? "dark" : "light";
            applyTheme(next);
            setTheme(next);
        };
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, []);

    function toggle() {
        const next: Theme = theme === "dark" ? "light" : "dark";
        localStorage.setItem(THEME_STORAGE_KEY, next);
        applyTheme(next);
        setTheme(next);
    }

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
