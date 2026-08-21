import { Link } from "react-router";
import LoginForm from "../src/auth/LoginForm";
import { PublicHeader } from "../src/components/PublicHeader";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <PublicHeader />
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 gap-4">
                <LoginForm />
                <p className="text-sm text-slate-500">
                    Non hai un account?{" "}
                    <Link to="/register" className="font-semibold text-brand hover:text-brand-hover">
                        Registrati
                    </Link>
                </p>
            </div>
        </div>
    );
}
