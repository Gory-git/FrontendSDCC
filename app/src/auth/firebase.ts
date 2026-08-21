// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, type UserCredential } from "firebase/auth";

const firebaseConfig = {
    apiKey:      import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:   import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId:       import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export function getFirebaseAuth() {
    return getAuth(app);
}

/**
 * Registra un nuovo utente su Firebase Auth.
 * Restituisce il UserCredential con l'ID Token già pronto.
 */
export async function registerWithFirebase(
    email: string,
    password: string
): Promise<UserCredential> {
    const auth = getFirebaseAuth();
    return createUserWithEmailAndPassword(auth, email, password);
}
