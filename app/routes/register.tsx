import RegisterForm from "../src/auth/RegisterForm";

export default function RegisterPage() {
    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">Registrazione</h1>
            <RegisterForm />
        </main>
    );
}