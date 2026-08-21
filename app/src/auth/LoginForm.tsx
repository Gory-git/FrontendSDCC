import { useState } from "react";
import { useNavigate } from "react-router";
import { loginWithEmailPassword } from "../auth/auth-client";
import { registerUser } from "../api/user";
import { ApiError } from "../api/client";

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
            const credential = await loginWithEmailPassword(email, password);

            const token = await credential.user.getIdToken();

            navigate("/dashboard");
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Login fallito");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    className="w-full border rounded p-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    className="w-full border rounded p-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="rounded bg-black text-white px-4 py-2"
            >
                {isLoading ? "Accesso..." : "Accedi"}
            </button>

            {errorMessage && <p className="text-red-600">{errorMessage}</p>}
        </form>
    );
}
