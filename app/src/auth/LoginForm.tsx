import { useState } from "react";
import { useNavigate } from "react-router";
import { loginWithEmailPassword } from "../auth/auth-client";
import { Card } from "../components/Card";
import { Field } from "../components/Field";
import { Button } from "../components/Button";

export default function LoginForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMessage("");
        setIsLoading(true);

        try {
            await loginWithEmailPassword(email, password);
            navigate("/dashboard");
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Login fallito");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto">
            <Card className="px-8 py-10">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900">Bentornato</h1>
                    <p className="mt-1 text-sm text-slate-500">Accedi al tuo account.</p>
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

                    {errorMessage && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
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
