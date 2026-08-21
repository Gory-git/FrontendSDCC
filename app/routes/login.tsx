import { Link } from "react-router";
import LoginForm from "../src/auth/LoginForm";

export default function LoginPage() {
    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            <LoginForm />
            <p className="mt-4">
                Non hai un account? <Link to="/register" className="underline">Registrati</Link>
            </p>
        </main>
    );
}