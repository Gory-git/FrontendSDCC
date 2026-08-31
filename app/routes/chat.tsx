import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "../src/features/user/hooks";
import { useAskChatbot, useChatStatus } from "../src/features/chat/hooks";
import { loadConversation, saveConversation } from "../src/features/chat/conversation";
import { PageContainer } from "../src/components/PageContainer";
import { Card } from "../src/components/Card";
import { Button } from "../src/components/Button";
import { Loading, ReceiptSpinner } from "../src/components/Loading";
import { errorMessage, isTooManyRequests } from "../src/lib/errorMessage";
import type { ChatMessage } from "../src/api/types";

/** Stesso limite del backend: meglio fermare qui che farsi rifiutare la richiesta. */
const MAX_CARATTERI = 500;

/**
 * Quanti messaggi passati rimandare. Il backend ne tiene comunque solo sei:
 * mandarne di più significherebbe pagare token che verrebbero scartati.
 */
const MAX_STORICO = 6;

/**
 * Il saluto d'apertura non passa dal modello: sarebbe una chiamata da dieci
 * secondi e da qualche migliaio di token per dire ogni volta la stessa frase.
 * Vive solo nell'interfaccia e non entra nella cronologia mandata al backend.
 */
function saluto(nome?: string): string {
    return `Ciao${nome ? ` ${nome}` : ""}, sono RiceVito, il tuo assistente AI di ReceiptHub. `
        + `In cosa posso esserti utile oggi?`;
}

const ESEMPI_ADMIN = [
    "Quante ricevute ci sono e quanto hanno fatturato?",
    "Qual è il prodotto più venduto degli ultimi due mesi?",
    "Chi sono i tre clienti che hanno speso di più?",
    "Ci sono ricevute sopra i 200 euro?",
];

const ESEMPI_CLIENTE = [
    "Quante ricevute ho e quanto ho speso in tutto?",
    "Qual è il mio acquisto più caro?",
    "Qual è il prodotto che compro più spesso?",
    "Mostrami le ricevute fra 20 e 50 euro",
];

function Bolla({ message }: { message: ChatMessage }) {
    const isUser = message.role === "user";
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={[
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    // whitespace-pre-wrap e non un renderer Markdown: le risposte
                    // arrivano come testo con a capo ed elenchi puntati, e una
                    // dipendenza in più non aggiungerebbe niente di leggibile.
                    "whitespace-pre-wrap break-words",
                    isUser
                        ? "bg-brand text-white rounded-br-md"
                        : "bg-muted text-fg rounded-bl-md",
                ].join(" ")}
            >
                {message.content}
            </div>
        </div>
    );
}

export default function ChatPage() {
    const { data: currentUser } = useCurrentUser();
    const status = useChatStatus();
    const ask = useAskChatbot();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState("");
    const [ripristinata, setRipristinata] = useState(false);
    const fineTranscript = useRef<HTMLDivElement>(null);

    // Quota giornaliera esaurita: il messaggio lo scrive l'interfaccia, come per
    // ogni altro errore, ma qui "Riprova" fallirebbe di sicuro e va tolto.
    const quotaEsaurita = isTooManyRequests(ask.error);

    const isAdmin = currentUser?.role === "ROLE_ADMIN";
    const esempi = isAdmin ? ESEMPI_ADMIN : ESEMPI_CLIENTE;

    // La conversazione si rilegge dopo il primo render e non con un inizializzatore
    // di useState: in SSR `sessionStorage` non esiste, e partire da un valore
    // diverso fra server e client romperebbe l'idratazione.
    useEffect(() => {
        setMessages(loadConversation());
        setRipristinata(true);
    }, []);

    // `ripristinata` evita la corsa fra i due effetti: senza, al primo giro si
    // salverebbe l'array vuoto sopra la conversazione appena ritrovata.
    useEffect(() => {
        if (ripristinata) saveConversation(messages);
    }, [messages, ripristinata]);

    // Ogni messaggio nuovo, e l'indicatore di attesa, portano la vista in fondo:
    // senza, la risposta arriva fuori schermo e sembra che non sia successo nulla.
    useEffect(() => {
        fineTranscript.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, ask.isPending]);

    function invia(domanda: string) {
        const testo = domanda.trim();
        if (!testo || ask.isPending) return;

        const storico = messages.slice(-MAX_STORICO);
        setMessages((precedenti) => [...precedenti, { role: "user", content: testo }]);
        setDraft("");
        ask.mutate(
            { question: testo, history: storico },
            { onSuccess: (answer) => setMessages((p) => [...p, { role: "assistant", content: answer }]) }
        );
    }

    /**
     * Ritenta l'ultima domanda senza riscriverla nel transcript: è già lì, e
     * duplicarla farebbe credere all'utente di averla posta due volte.
     */
    function riprova() {
        const ultimo = messages[messages.length - 1];
        if (!ultimo || ultimo.role !== "user" || ask.isPending) return;
        ask.mutate(
            { question: ultimo.content, history: messages.slice(0, -1).slice(-MAX_STORICO) },
            { onSuccess: (answer) => setMessages((p) => [...p, { role: "assistant", content: answer }]) }
        );
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        // Invio manda, Maiusc+Invio va a capo: è quello che si aspetta chi ha
        // usato una chat qualsiasi.
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            invia(draft);
        }
    }

    if (status.isPending)
        return (
            <PageContainer>
                <Loading label="RiceVito sta arrivando..." />
            </PageContainer>
        );

    if (status.isError || status.data === false)
        return (
            <PageContainer>
                <h1 className="text-2xl font-bold text-fg">RiceVito</h1>
                <Card>
                    <p className="text-sm text-fg-secondary">
                        RiceVito non è disponibile su questo ambiente. Le altre funzioni
                        dell'applicazione non sono toccate.
                    </p>
                </Card>
            </PageContainer>
        );

    return (
        <PageContainer>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-fg">RiceVito</h1>
                    <p className="text-sm text-fg-muted mt-1">
                        Fai una domanda sulle {isAdmin ? "ricevute, sui clienti e sulle statistiche" : "tue ricevute e sui tuoi acquisti"}.
                    </p>
                </div>
                {messages.length > 0 && (
                    <Button
                        variant="secondary"
                        onClick={() => { setMessages([]); ask.reset(); }}
                        disabled={ask.isPending}
                        className="shrink-0"
                    >
                        Nuova conversazione
                    </Button>
                )}
            </div>

            <Card className="space-y-4">
                <div
                    className="max-h-[55vh] overflow-y-auto space-y-3 pr-1"
                    aria-live="polite"
                    aria-busy={ask.isPending}
                >
                    <Bolla message={{ role: "assistant", content: saluto(currentUser?.name) }} />

                    {messages.length === 0 && !ask.isPending && (
                        <div className="space-y-4 py-2">
                            <p className="text-sm text-fg-secondary">
                                RiceVito legge solo i dati che potresti già vedere nelle altre
                                pagine, e non può modificare né cancellare nulla.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {esempi.map((esempio) => (
                                    <button
                                        key={esempio}
                                        type="button"
                                        onClick={() => invia(esempio)}
                                        className="rounded-full border border-line-strong bg-card px-3 py-1.5 text-xs text-fg-secondary hover:bg-muted transition-colors"
                                    >
                                        {esempio}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((message, i) => (
                        <Bolla key={i} message={message} />
                    ))}

                    {ask.isPending && (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-3 rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm text-fg-muted">
                                <ReceiptSpinner size="sm" />
                                {/* La risposta richiede una decina di secondi: dire cosa sta
                                    facendo evita che sembri bloccata. */}
                                Sto consultando i dati...
                            </div>
                        </div>
                    )}

                    {ask.isError && (
                        <div className="flex justify-start">
                            <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-danger-line bg-danger-bg px-4 py-2.5 text-sm text-danger space-y-2">
                                <p>
                                    {quotaEsaurita
                                        ? "Hai esaurito le domande a RiceVito per oggi. Riprova domani."
                                        : errorMessage(ask.error, "Non è stato possibile ottenere una risposta.")}
                                </p>
                                {!quotaEsaurita && (
                                    <Button variant="secondary" onClick={riprova} className="px-3 py-1.5 text-xs">
                                        Riprova
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    <div ref={fineTranscript} />
                </div>

                <form
                    onSubmit={(e) => { e.preventDefault(); invia(draft); }}
                    className="flex items-end gap-3 border-t border-line pt-4"
                >
                    <div className="flex-1 space-y-1">
                        <label htmlFor="domanda" className="sr-only">La tua domanda</label>
                        <textarea
                            id="domanda"
                            rows={2}
                            value={draft}
                            maxLength={MAX_CARATTERI}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Scrivi una domanda..."
                            className="w-full resize-none rounded-lg border border-line-strong bg-card px-3 py-2.5 text-sm text-fg placeholder-fg-muted outline-none transition-all duration-150 focus:border-brand focus:ring-2 focus:ring-brand-ring ring-offset-card"
                        />
                        <p className="text-xs text-fg-muted text-right">
                            {draft.length}/{MAX_CARATTERI}
                        </p>
                    </div>
                    <Button type="submit" disabled={ask.isPending || !draft.trim()} className="mb-6 shrink-0">
                        {ask.isPending ? <ReceiptSpinner size="sm" /> : "Invia"}
                    </Button>
                </form>
            </Card>
        </PageContainer>
    );
}
