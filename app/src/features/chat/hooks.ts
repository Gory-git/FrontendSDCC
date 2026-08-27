import { useMutation, useQuery } from "@tanstack/react-query";
import { askChatbot, getChatStatus } from "../../api/chat";
import type { ChatMessage } from "../../api/types";

/**
 * La configurazione del chatbot non cambia mentre l'app è aperta: si chiede una
 * volta e non si rinfresca più.
 */
export function useChatStatus() {
    return useQuery({
        queryKey: ["chat", "status"],
        queryFn: getChatStatus,
        staleTime: Infinity,
    });
}

/**
 * Le risposte non si mettono in cache: la stessa domanda posta due volte è una
 * domanda nuova, e la conversazione vive nello stato della pagina.
 */
export function useAskChatbot() {
    return useMutation({
        mutationFn: ({ question, history }: { question: string; history: ChatMessage[] }) =>
            askChatbot(question, history),
    });
}
