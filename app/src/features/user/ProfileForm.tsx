import { useState } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "../../api/client";
import type { UserDTO, UserUpdateDTO } from "../../api/types";
import { Button } from "../../components/Button";
import { ReceiptSpinner } from "../../components/Loading";
import { errorMessage } from "../../lib/errorMessage";
import { Field } from "../../components/Field";
import {
    validateCodiceFiscale,
    validatePhone,
    validateRequired,
} from "../../lib/userValidation";

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

/**
 * Form dei dati anagrafici, condiviso fra il proprio profilo e la modifica da admin.
 * La mutazione arriva dall'esterno perché è l'unica cosa che cambia fra i due casi:
 * la validazione, i campi e la traduzione degli errori sono identici, e duplicarli
 * significherebbe farli divergere.
 *
 * Il form invia sempre tutti e quattro i campi: il backend riscrive telefono e codice
 * fiscale con quello che trova nel corpo della richiesta, quindi ometterli li
 * cancellerebbe invece di lasciarli invariati.
 */
export function ProfileForm({
    user,
    onClose,
    mutation,
}: {
    user: UserDTO;
    onClose: () => void;
    mutation: UseMutationResult<UserDTO, Error, UserUpdateDTO, unknown>;
}) {
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

        mutation.mutate(form, { onSuccess: onClose });
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

            {mutation.isError && (
                <p className="text-sm text-danger">{saveErrorMessage(mutation.error)}</p>
            )}

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? <><ReceiptSpinner size="sm" />Salvataggio...</> : "Salva"}
                </Button>
                <Button type="button" variant="secondary" onClick={onClose}
                        disabled={mutation.isPending}>
                    Annulla
                </Button>
            </div>
        </form>
    );
}
