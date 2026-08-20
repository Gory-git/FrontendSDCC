import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    type User,
} from "firebase/auth";
import { auth } from "./firebase";

export function observeAuth(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

export async function loginWithEmailPassword(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
    return signOut(auth);
}

export async function getBearerToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
}
