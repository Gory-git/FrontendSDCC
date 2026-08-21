import RegisterForm from "../src/auth/RegisterForm";
import { PublicHeader } from "../src/components/PublicHeader";

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <PublicHeader />
            <div className="flex flex-1 items-center justify-center px-6 py-12">
                <RegisterForm />
            </div>
        </div>
    );
}
