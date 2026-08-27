import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";

import type { Route } from "./+types/root";
import "./app.css";
import React from "react";
import { queryClient } from "./src/api/queryClient";
import { ThemeProvider, themeInitScript } from "./src/theme/ThemeProvider";

export const links: Route.LinksFunction = () => [
  // L'icona della scheda. In SVG e non in .ico: e' nitida a ogni dimensione
  // (16px nella scheda, 32 nei preferiti, di piu' nella schermata iniziale su
  // mobile) e resta un file di testo versionabile invece che un binario.
  // `public/favicon.ico` resta come ripiego per i browser che non leggono SVG.
  { rel: "icon", type: "image/svg+xml", href: "/icon.svg" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    // `themeInitScript` scrive class e color-scheme su <html> prima
    // dell'idratazione: il markup del server non può combaciare per forza.
    <html lang="it" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Outlet />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isNotFoundPage = isRouteErrorResponse(error) && error.status === 404;

  // L'errore vero finisce in console, dove serve a chi sviluppa: a schermo
  // niente messaggi interni e nessuno stack trace.
  if (import.meta.env.DEV) console.error(error);

  return (
    <main className="max-w-4xl mx-auto px-6 py-16 space-y-3 text-center">
      <h1 className="text-2xl font-bold text-fg">
        {isNotFoundPage ? "Pagina non trovata" : "Qualcosa è andato storto"}
      </h1>
      <p className="text-fg-muted">
        {isNotFoundPage
          ? "L'indirizzo che hai aperto non esiste."
          : "Si è verificato un errore imprevisto. Riprova, o torna alla dashboard."}
      </p>
      <p>
        <Link to="/dashboard" className="text-brand-fg font-semibold">
          Torna alla dashboard
        </Link>
      </p>
    </main>
  );
}
