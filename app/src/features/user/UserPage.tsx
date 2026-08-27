import { useState } from "react";
import { ApiError } from "../../api/client";
import type { UserDTO } from "../../api/types";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Loading, ReceiptSpinner } from "../../components/Loading";
import { errorMessage } from "../../lib/errorMessage";
import { Field } from "../../components/Field";
import {
    validateCodiceFiscale,
    validatePhone,
    validateRequired,
} from "../../lib/userValidation";
import { useCurrentUser, useUpdateCurrentUser } from "./hooks";

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

function saveErrorMessage(error: unknown): string {
    if (error instanceof ApiError && error.status === 409)
        return "Codice fiscale o telefono già associati a un altro account.";
    return errorMessage(error, "Non è stato possibile salvare le modifiche.");
}

function ProfileForm({ user, onClose }: { user: UserDTO; onClose: () => void }) {
    const updateUser = useUpdateCurrentUser();
    const [form, setForm] = useState<FormState>({
        name: user.name ?? "",
        surname: user.surname ?? "",
        phone: user.phone ?? "",
        codiceFiscale: user.codiceFiscale ?? "",
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

        updateUser.mutate(form, { onSuccess: onClose });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <Field id="name" label="Nome" value={form.name}
                       error={errors.name} onChange={field("name")} required />
                <Field id="surname" label="Cognome" value={form.surname}
                       error={errors.surname} onChange={field("surname")} required />
            </div>
            <Field id="phone" label="Telefono (opzionale)" value={form.phone}
                   placeholder="+39 333 123 4567" error={errors.phone} onChange={field("phone")} />
            <Field id="codiceFiscale" label="Codice fiscale (opzionale)" value={form.codiceFiscale}
                   placeholder="RSSMRA85M01H501Z" error={errors.codiceFiscale}
                   onChange={field("codiceFiscale")} />

            {updateUser.isError && (
                <p className="text-sm text-danger">{saveErrorMessage(updateUser.error)}</p>
            )}

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={updateUser.isPending}>
                    {updateUser.isPending ? <><ReceiptSpinner size="sm" />Salvataggio...</> : "Salva"}
                </Button>
                <Button type="button" variant="secondary" onClick={onClose}
                        disabled={updateUser.isPending}>
                    Annulla
                </Button>
            </div>
        </form>
    );
}

export default function UserPage() {
    const { data: user, isLoading, isError, error } = useCurrentUser();
    const [isEditing, setIsEditing] = useState(false);

    if (isLoading) return <Card><Loading label="Caricamento profilo..." /></Card>;
    if (isError) return <Card className="text-danger">{errorMessage(error, "Non è stato possibile caricare il profilo.")}</Card>;
    if (!user) return <Card className="text-fg-muted">Nessun utente.</Card>;

    return (
        <Card className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-fg">Profilo</h2>
                {!isEditing && (
                    <Button variant="secondary" className="px-3 py-1.5"
                            onClick={() => setIsEditing(true)}>
                        Modifica
                    </Button>
                )}
            </div>

            {isEditing ? (
                <ProfileForm user={user} onClose={() => setIsEditing(false)} />
            ) : (
                <div className="space-y-1">
                    <p className="text-fg-secondary">{user.name} {user.surname}</p>
                    <p className="text-fg-muted text-sm">{user.email}</p>
                    <p className="text-fg-muted text-sm">{user.phone || "Telefono non inserito"}</p>
                    <p className="text-fg-muted text-sm">
                        {user.codiceFiscale || "Codice fiscale non inserito"}
                    </p>
                </div>
            )}
        </Card>
    );
}
