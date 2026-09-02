import { useState } from "react";
import { useNavigate } from "react-router";
import { loginWithEmailPassword, sendPasswordReset } from "../auth/auth-client";
import { Card } from "../components/Card";
import { Field } from "../components/Field";
import { Button } from "../components/Button";
import { firebaseErrorMessage } from "../lib/firebaseError";

export default function LoginForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState("");
    const [isSendingReset, setIsSendingReset] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMessage("");
        setResetMessage("");
        setIsLoading(true);

        try {
            await loginWithEmailPassword(email, password);
            navigate("/dashboard");
        } catch (error) {
            setErrorMessage(firebaseErrorMessage(error, "Accesso non riuscito. Riprova."));
        } finally {
            setIsLoading(false);
        }
    }

    async function handlePasswordReset() {
        setErrorMessage("");
        setResetMessage("");

        // L'email è quella già scritta nel form: chiederla una seconda volta in un
        // campo a parte duplicherebbe l'unico dato che serve.
        if (!email.trim()) {
            setErrorMessage("Inserisci la tua email, poi premi di nuovo.");
            return;
        }

        setIsSendingReset(true);
        try {
            await sendPasswordReset(email.trim());
            // Messaggio volutamente identico anche per un indirizzo non registrato:
            // vedi il commento su sendPasswordReset.
            setResetMessage("Se l'indirizzo è registrato, riceverai un'email con le istruzioni.");
        } catch (error) {
            setErrorMessage(firebaseErrorMessage(error, "Invio non riuscito. Riprova."));
        } finally {
            setIsSendingReset(false);
        }
    }

    return (
        <div className="max-w-md mx-auto">
            <Card className="px-8 py-10">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-fg">Bentornato</h1>
                    <p className="mt-1 text-sm text-fg-muted">Accedi al tuo account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Field
                        id="email"
                        label="Email"
                        type="email"
                        value={email}
                        placeholder="mario.rossi@email.com"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Field
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="flex justify-end -mt-2">
                        <button
                            type="button"
                            onClick={handlePasswordReset}
                            disabled={isSendingReset || isLoading}
                            className="text-sm text-brand-fg hover:text-brand-hover disabled:opacity-60"
                        >
                            {isSendingReset ? "Invio in corso..." : "Password dimenticata?"}
                        </button>
                    </div>

                    {resetMessage && (
                        <p className="text-sm text-success">{resetMessage}</p>
                    )}

                    {errorMessage && (
                        <div className="rounded-lg border border-danger-line bg-danger-bg px-4 py-3 text-sm text-danger flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
                            </svg>
                            {errorMessage}
                        </div>
                    )}

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? "Accesso..." : "Accedi"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
