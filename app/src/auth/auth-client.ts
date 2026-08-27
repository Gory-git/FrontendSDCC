import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { queryClient } from "../api/queryClient";
import { clearConversation } from "../features/chat/conversation";

export function observeAuth(callback: (user: User | null) => void) {
    return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function loginWithEmailPassword(email: string, password: string) {
    return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function logout() {
    await signOut(getFirebaseAuth());
    // Il QueryClient è un singleton di modulo che sopravvive al logout: senza
    // questo, chi entra dopo vede i dati in cache dell'utente precedente finché
    // il refetch non risponde (e se il refetch fallisce, li vede per sempre).
    queryClient.clear();
    // Stesso motivo: il transcript di RiceVito contiene importi e codici di chi
    // ha appena chiuso la sessione.
    clearConversation();
}

export async function getBearerToken(): Promise<string | null> {
    const user = getFirebaseAuth().currentUser;
    if (!user) return null;
    return user.getIdToken();
}
