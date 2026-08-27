import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Field } from "../components/Field";
import { ReceiptSpinner } from "../components/Loading";
import { errorMessage } from "../lib/errorMessage";
import {
    validateCodiceFiscale,
    validatePhone,
    validateRequired,
} from "../lib/userValidation";
import { useCompleteRegistration } from "../features/user/hooks";
import { logout } from "./auth-client";

type FormState = {
    name: string;
    surname: string;
    phone: string;
    codiceFiscale: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FormErrors {
    const errors: FormErrors = {};
    const name = validateRequired(form.name, "Il nome è obbligatorio.");
    const surname = validateRequired(form.surname, "Il cognome è obbligatorio.");
    const phone = validatePhone(form.phone);
    const codiceFiscale = validateCodiceFiscale(form.codiceFiscale);
    if (name) errors.name = name;
    if (surname) errors.surname = surname;
    if (phone) errors.phone = phone;
    if (codiceFiscale) errors.codiceFiscale = codiceFiscale;
    return errors;
}

/**
 * Schermata per chi è autenticato su Firebase ma non ha ancora un profilo nel
 * database. Capita a chi si registra e vede fallire la seconda metà della
 * procedura, e a chi ha un account valido su un ambiente nuovo. Senza questa
 * schermata l'utente resta bloccato: ogni pagina risponde 404 e il messaggio
 * parla di un errore di caricamento, che non suggerisce nulla da fare.
 */
export default function CompleteProfile({ email }: { email: string | null }) {
    const navigate = useNavigate();
    const complete = useCompleteRegistration();
    const [form, setForm] = useState<FormState>({
        name: "", surname: "", phone: "", codiceFiscale: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});

    function field(key: keyof FormState) {
        return (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [key]: e.target.value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const validationErrors = validate(form);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;
        complete.mutate(form);
    }

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    return (
        <main className="max-w-lg mx-auto px-6 py-12">
            <Card className="space-y-5">
                <div>
                    <h1 className="text-xl font-bold text-fg">Completa la registrazione</h1>
                    <p className="mt-1 text-sm text-fg-muted">
                        L'accesso è riuscito, ma mancano i tuoi dati. Compilali per iniziare a
                        usare ReceiptHub.
                    </p>
                    {email && (
                        <p className="mt-2 text-sm text-fg-secondary">
                            Stai completando il profilo di <strong>{email}</strong>.
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field id="name" label="Nome" value={form.name}
                               error={errors.name} onChange={field("name")} required />
                        <Field id="surname" label="Cognome" value={form.surname}
                               error={errors.surname} onChange={field("surname")} required />
                    </div>
                    <Field id="phone" label="Telefono (opzionale)" value={form.phone}
                           placeholder="+39 333 123 4567" error={errors.phone}
                           onChange={field("phone")} />
                    <Field id="codiceFiscale" label="Codice fiscale (opzionale)"
                           value={form.codiceFiscale} placeholder="RSSMRA85M01H501Z"
                           error={errors.codiceFiscale} onChange={field("codiceFiscale")} />

                    {complete.isError && (
                        <p className="text-sm text-danger">
                            {errorMessage(complete.error, "Non è stato possibile completare la registrazione.")}
                        </p>
                    )}

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={complete.isPending}>
                            {complete.isPending
                                ? <><ReceiptSpinner size="sm" />Salvataggio...</>
                                : "Completa"}
                        </Button>
                        {/* Senza questo, chi entra con l'account sbagliato non ha via d'uscita. */}
                        <Button type="button" variant="ghost" onClick={handleLogout}
                                disabled={complete.isPending}>
                            Esci
                        </Button>
                    </div>
                </form>
            </Card>
        </main>
    );
}
