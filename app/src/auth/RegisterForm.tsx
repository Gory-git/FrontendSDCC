import React, { useState } from "react";
import { registerWithFirebase } from "../auth/firebase";
import { apiFetch } from "../api/client";

// ── Tipi ──────────────────────────────────────────────────────────────────────

interface FormData {
    name:      string;
    surname:   string;
    email:     string;
    password:  string;
    phone:     string;
}

interface FormErrors {
    name?:      string;
    surname?:   string;
    email?:     string;
    password?:  string;
    phone?:     string;
    global?:    string;
}

// ── Validazione ───────────────────────────────────────────────────────────────

function validate(data: FormData): FormErrors {
    const errors: FormErrors = {};

    if (!data.name.trim())
        errors.name = "Il nome è obbligatorio.";

    if (!data.surname.trim())
        errors.surname = "Il cognome è obbligatorio.";

    if (!data.email.trim())
        errors.email = "L'email è obbligatoria.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        errors.email = "Formato email non valido.";

    if (!data.password)
        errors.password = "La password è obbligatoria.";
    else if (data.password.length < 8)
        errors.password = "La password deve avere almeno 8 caratteri.";
    else if (!/[A-Z]/.test(data.password) || !/[0-9]/.test(data.password))
        errors.password = "Deve contenere almeno una maiuscola e un numero.";

    if (data.phone && !/^\+?[\d\s\-()]{7,15}$/.test(data.phone))
        errors.phone = "Formato telefono non valido.";

    return errors;
}

function mapFirebaseError(code: string): string {
    const map: Record<string, string> = {
        "auth/email-already-in-use":   "Questa email è già registrata.",
        "auth/invalid-email":          "Formato email non valido.",
        "auth/weak-password":          "Password troppo debole.",
        "auth/network-request-failed": "Errore di rete. Controlla la connessione.",
    };
    return map[code] ?? `Errore Firebase: ${code}`;
}

// ── Password Strength Bar ─────────────────────────────────────────────────────

function getStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;
    if (password.length >= 8)          score++;
    if (/[A-Z]/.test(password))        score++;
    if (/[0-9]/.test(password))        score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
        { label: "Molto debole", color: "bg-red-500"    },
        { label: "Debole",       color: "bg-orange-400" },
        { label: "Discreta",     color: "bg-yellow-400" },
        { label: "Forte",        color: "bg-green-400"  },
        { label: "Molto forte",  color: "bg-green-600"  },
    ];

    return { score, ...levels[score] };
}

function PasswordStrengthBar({ password }: { password: string }) {
    const { score, label, color } = getStrength(password);
    return (
        <div className="space-y-1">
            <div className="flex gap-1">
                {[0, 1, 2, 3].map(i => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i < score ? color : "bg-slate-200"
                        }`}
                    />
                ))}
            </div>
            <p className="text-xs text-slate-500">{label}</p>
        </div>
    );
}

// ── Field ─────────────────────────────────────────────────────────────────────

interface FieldProps {
    id:           keyof FormData;
    label:        string;
    type?:        string;
    value:        string;
    error?:       string;
    placeholder?: string;
    onChange:     (e: React.ChangeEvent<HTMLInputElement>) => void;
    rightSlot?:   React.ReactNode;
}

function Field({ id, label, type = "text", value, error, placeholder, onChange, rightSlot }: FieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-semibold text-slate-700">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    name={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={[
                        "w-full rounded-lg border px-3 py-2.5 text-sm bg-white",
                        "text-slate-900 placeholder-slate-400 outline-none",
                        "transition-all duration-150 focus:ring-2 focus:ring-offset-1",
                        rightSlot ? "pr-10" : "",
                        error
                            ? "border-red-400 focus:ring-red-300"
                            : "border-slate-300 focus:border-slate-500 focus:ring-slate-200",
                    ].join(" ")}
                />
                {rightSlot && (
                    <div className="absolute inset-y-0 right-3 flex items-center">
                        {rightSlot}
                    </div>
                )}
            </div>
            {error && (
                <p id={`${id}-error`} className="text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

// ── Componente Principale ─────────────────────────────────────────────────────

export default function RegisterForm() {
    const [form, setForm] = useState<FormData>({
        name:      "",
        surname:   "",
        email:     "",
        password:  "",
        phone:     "",
    });

    const [errors,       setErrors]       = useState<FormErrors>({});
    const [isLoading,    setIsLoading]    = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [success,      setSuccess]      = useState(false);

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
                    name:        form.name,
                    surname:     form.surname,
                    email:       form.email,
                    phone:       form.phone,
                    firebaseUid: credential.user.uid,
                }),
            });

            setSuccess(true);
        } catch (err: any) {
            if (err?.code?.startsWith("auth/")) {
                setErrors({ global: mapFirebaseError(err.code) });
            } else {
                setErrors({ global: err?.message ?? "Errore durante la registrazione." });
            }
        } finally {
            setIsLoading(false);
        }
    }

    // ── Stato di successo ─────────────────────────────────────────────────────

    if (success) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-8 py-10 text-center shadow-sm max-w-md mx-auto">
                <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h2 className="text-lg font-bold text-green-800">Registrazione completata!</h2>
                <p className="text-sm text-green-700">Controlla la tua email per verificare l'account.</p>
            </div>
        );
    }

    // ── Form ──────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-md mx-auto">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-md px-8 py-10">

                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900">Crea un account</h1>
                    <p className="mt-1 text-sm text-slate-500">Compila i campi per registrarti.</p>
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
                                className="text-slate-400 hover:text-slate-700 transition-colors"
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

                    {/* Errore globale (Firebase / rete) */}
                    {errors.global && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
                            </svg>
                            {errors.global}
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
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
                    </button>

                </form>
            </div>
        </div>
    );
}
