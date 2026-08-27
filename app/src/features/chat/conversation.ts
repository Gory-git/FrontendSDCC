import type { ChatMessage } from "../../api/types";

/**
 * La conversazione con RiceVito sopravvive al cambio di pagina e a un ricarico,
 * ma non alla chiusura della scheda: per questo `sessionStorage` e non
 * `localStorage`. È una sessione di lavoro, non un documento da conservare, e
 * meno dati delle ricevute restano sul disco meglio è.
 *
 * Va ripulita quando cambia l'utente, esattamente come `queryClient.clear()`:
 * il transcript contiene importi, codici ed email di chi l'ha scritto, e chi
 * accede dopo su questo browser non deve trovarlo. Le due chiamate stanno in
 * `auth-client.logout()` e nella rete di sicurezza di `RequireAuth`.
 */

const CHIAVE = "receipthub.chat";

/**
 * Un tetto ai messaggi conservati: `sessionStorage` non è infinito e una
 * conversazione lunghissima non serve a nessuno, visto che al backend ne
 * vengono comunque mandati solo gli ultimi sei.
 */
const MAX_MESSAGGI = 40;

function disponibile(): boolean {
    // In SSR `sessionStorage` non esiste; in alcuni browser l'accesso stesso
    // solleva (navigazione privata, cookie di terze parti bloccati).
    return typeof window !== "undefined" && !!window.sessionStorage;
}

export function loadConversation(): ChatMessage[] {
    if (!disponibile()) return [];
    try {
        const grezzo = window.sessionStorage.getItem(CHIAVE);
        if (!grezzo) return [];
        const valore = JSON.parse(grezzo);
        if (!Array.isArray(valore)) return [];
        // Il contenuto è stato scritto da noi, ma arriva da fuori dal programma:
        // si tiene solo ciò che ha la forma giusta invece di fidarsi.
        return valore.filter(
            (m): m is ChatMessage =>
                !!m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"),
        );
    } catch {
        return [];
    }
}

export function saveConversation(messages: ChatMessage[]): void {
    if (!disponibile()) return;
    try {
        if (messages.length === 0) {
            window.sessionStorage.removeItem(CHIAVE);
            return;
        }
        window.sessionStorage.setItem(CHIAVE, JSON.stringify(messages.slice(-MAX_MESSAGGI)));
    } catch {
        // Spazio esaurito o storage negato: la conversazione resta comunque
        // viva nello stato della pagina, si perde solo cambiando scheda.
    }
}

export function clearConversation(): void {
    if (!disponibile()) return;
    try {
        window.sessionStorage.removeItem(CHIAVE);
    } catch {
        // Niente da fare: se non si può scrivere, non si può nemmeno cancellare.
    }
}
