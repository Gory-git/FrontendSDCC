import { apiFetch } from "./client";
import type { ChatMessage, ChatResponseDTO } from "./types";

/**
 * Manda una domanda all'assistente. `history` sono gli scambi precedenti, che
 * il backend usa per capire i riferimenti impliciti ("e il mese scorso?").
 */
export async function askChatbot(question: string, history: ChatMessage[]): Promise<string> {
    const response = await apiFetch<ChatResponseDTO>("/chat", {
        method: "POST",
        body: JSON.stringify({ question, history }),
    });
    return response.answer;
}

/**
 * Dice se il chatbot è configurato su questo ambiente (in locale spesso non lo
 * è, perché manca la chiave). Serve a non mostrare una pagina che risponderebbe
 * solo con un errore.
 */
export async function getChatStatus(): Promise<boolean> {
    return apiFetch<boolean>("/chat/status");
}
