import { useState } from "react";
import { changePassword } from "../../auth/auth-client";
import { Button } from "../../components/Button";
import { Field } from "../../components/Field";
import { ReceiptSpinner } from "../../components/Loading";
import { PasswordStrengthBar } from "../../components/PasswordStrengthBar";
import { firebaseErrorMessage, isFirebaseError } from "../../lib/firebaseError";
import { validatePassword } from "../../lib/userValidation";

type FormState = {
    current: string;
    next: string;
    confirm: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FormErrors {
    const errors: FormErrors = {};

    if (!form.current) errors.current = "Inserisci la password attuale.";

    const next = validatePassword(form.next);
    if (next) errors.next = next;
    else if (form.next === form.current)
        errors.next = "La nuova password è uguale a quella attuale.";

    if (form.confirm !== form.next) errors.confirm = "Le due password non coincidono.";

    return errors;
}

/**
 * La mappa condivisa traduce questi due codici con "Email o password non corretti",
 * che è giusto sulla pagina di accesso ma fuorviante qui: l'email non c'entra, e
 * l'unico campo in gioco è la password attuale.
 */
function changeErrorMessage(error: unknown): string {
    if (isFirebaseError(error) &&
        (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential"))
        return "La password attuale non è corretta.";
    return firebaseErrorMessage(error, "Non è stato possibile cambiare la password.");
}

export function ChangePasswordForm(
    { onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }
) {
    const [form, setForm] = useState<FormState>({ current: "", next: "", confirm: "" });
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    function field(key: keyof FormState) {
        return (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [key]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitError("");

        const validationErrors = validate(form);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setIsSaving(true);
        try {
            await changePassword(form.current, form.next);
            onSuccess();
        } catch (error) {
            setSubmitError(changeErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Field id="current-password" label="Password attuale" type="password"
                   value={form.current} error={errors.current} onChange={field("current")} required />

            <div className="space-y-2">
                <Field id="new-password" label="Nuova password" type="password"
                       value={form.next} error={errors.next} onChange={field("next")} required />
                {form.next && <PasswordStrengthBar password={form.next} />}
            </div>

            <Field id="confirm-password" label="Conferma nuova password" type="password"
                   value={form.confirm} error={errors.confirm} onChange={field("confirm")} required />

            {submitError && <p className="text-sm text-danger">{submitError}</p>}

            <p className="text-xs text-fg-muted">
                Cambiando la password verrai disconnesso dagli altri dispositivi.
            </p>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? <><ReceiptSpinner size="sm" />Salvataggio...</> : "Cambia password"}
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
                    Annulla
                </Button>
            </div>
        </form>
    );
}
