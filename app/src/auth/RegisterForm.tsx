import React, { useState } from "react";
import { useNavigate } from "react-router";
import { registerWithFirebase } from "../auth/firebase";
import { apiFetch } from "../api/client";
import { Card } from "../components/Card";
import { Field } from "../components/Field";
import { Button } from "../components/Button";
import { validateCodiceFiscale, validatePassword, validatePhone, validateRequired } from "../lib/userValidation";
import { PasswordStrengthBar } from "../components/PasswordStrengthBar";
import { errorMessage } from "../lib/errorMessage";
import { firebaseErrorMessage, isFirebaseError } from "../lib/firebaseError";

// ── Tipi ──────────────────────────────────────────────────────────────────────

interface FormData {
    name:          string;
    surname:       string;
    email:         string;
    password:      string;
    phone:         string;
    codiceFiscale: string;
}

interface FormErrors {
    name?:          string;
    surname?:       string;
    email?:         string;
    password?:      string;
    phone?:         string;
    codiceFiscale?: string;
    global?:        string;
}

// ── Validazione ───────────────────────────────────────────────────────────────

function validate(data: FormData): FormErrors {
    const errors: FormErrors = {};

    errors.name = validateRequired(data.name, "Il nome è obbligatorio.");
    errors.surname = validateRequired(data.surname, "Il cognome è obbligatorio.");

    if (!data.email.trim())
        errors.email = "L'email è obbligatoria.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        errors.email = "Formato email non valido.";

    errors.password = validatePassword(data.password);

    errors.phone = validatePhone(data.phone);
    errors.codiceFiscale = validateCodiceFiscale(data.codiceFiscale);

    // Le chiavi con valore undefined falserebbero i controlli "quanti errori ci sono".
    (Object.keys(errors) as (keyof FormErrors)[]).forEach((key) => {
        if (errors[key] === undefined) delete errors[key];
    });

    return errors;
}

// ── Componente Principale ─────────────────────────────────────────────────────

export default function RegisterForm() {
    const navigate = useNavigate();
    const [form, setForm] = useState<FormData>({
        name:          "",
        surname:       "",
        email:         "",
        password:      "",
        phone:         "",
        codiceFiscale: "",
    });

    const [errors,       setErrors]       = useState<FormErrors>({});
    const [isLoading,    setIsLoading]    = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const validationErrors = validate(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            const credential = await registerWithFirebase(form.email, form.password);
            const idToken    = await credential.user.getIdToken();

            await apiFetch("/user/register", {
                method: "POST",
                headers: {
                    "Content-Type":  "application/json",
                    "Authorization": `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    name:          form.name,
                    surname:       form.surname,
                    email:         form.email,
                    phone:         form.phone,
                    codiceFiscale: form.codiceFiscale || undefined,
                    firebaseUid:   credential.user.uid,
                }),
            });

            navigate("/dashboard");
        } catch (err: any) {
            const fallback = "Non è stato possibile completare la registrazione.";
            setErrors({
                global: isFirebaseError(err)
                    ? firebaseErrorMessage(err, fallback)
                    : errorMessage(err, fallback),
            });
        } finally {
            setIsLoading(false);
        }
    }

    // ── Form ──────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-md mx-auto">
            <Card className="px-8 py-10">

                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-fg">Crea un account</h1>
                    <p className="mt-1 text-sm text-fg-muted">Compila i campi per registrarti.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">

                    {/* Nome + Cognome su 2 colonne */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field id="name"    label="Nome"    value={form.name}    error={errors.name}    placeholder="Mario" onChange={handleChange} />
                        <Field id="surname" label="Cognome" value={form.surname} error={errors.surname} placeholder="Rossi" onChange={handleChange} />
                    </div>

                    {/* Email */}
                    <Field
                        id="email"
                        label="Email"
                        type="email"
                        value={form.email}
                        error={errors.email}
                        placeholder="mario.rossi@email.com"
                        onChange={handleChange}
                    />

                    {/* Password + toggle */}
                    <Field
                        id="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        error={errors.password}
                        placeholder="Min. 8 caratteri"
                        onChange={handleChange}
                        rightSlot={
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="text-fg-muted hover:text-fg-secondary transition-colors"
                                aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                            >
                                {showPassword ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                )}
                            </button>
                        }
                    />

                    {/* Barra forza password */}
                    {form.password.length > 0 && (
                        <PasswordStrengthBar password={form.password} />
                    )}

                    {/* Telefono */}
                    <Field
                        id="phone"
                        label="Telefono (opzionale)"
                        type="tel"
                        value={form.phone}
                        error={errors.phone}
                        placeholder="+39 333 123 4567"
                        onChange={handleChange}
                    />

                    {/* Codice fiscale */}
                    <Field
                        id="codiceFiscale"
                        label="Codice fiscale (opzionale)"
                        value={form.codiceFiscale}
                        error={errors.codiceFiscale}
                        placeholder="RSSMRA80A01H501U"
                        onChange={(e) => {
                            setForm(prev => ({ ...prev, codiceFiscale: e.target.value.toUpperCase() }));
                            if (errors.codiceFiscale) setErrors(prev => ({ ...prev, codiceFiscale: undefined }));
                        }}
                    />

                    {/* Errore globale (Firebase / rete) */}
                    {errors.global && (
                        <div className="rounded-lg border border-danger-line bg-danger-bg px-4 py-3 text-sm text-danger flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
                            </svg>
                            {errors.global}
                        </div>
                    )}

                    {/* Submit button */}
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? (
                            <>
                                {/* Spinner SVG */}
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                                </svg>
                                Registrazione in corso…
                            </>
                        ) : (
                            "Registrati"
                        )}
                    </Button>

                </form>
            </Card>
        </div>
    );
}
