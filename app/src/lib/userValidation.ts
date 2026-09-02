/**
 * Validazione dei campi anagrafici, condivisa fra il form di registrazione e quello
 * di modifica del profilo: le stesse regole vivono anche in `UserUpdateDTO` lato
 * backend, qui servono solo a dare un errore immediato senza fare il giro di rete.
 */

const PHONE_PATTERN = /^\+?[\d\s\-()]{7,15}$/;
const CODICE_FISCALE_PATTERN = /^[A-Za-z0-9]{16}$/;

export function validateRequired(value: string, message: string): string | undefined {
    return value.trim() ? undefined : message;
}

/** Il telefono è opzionale: valida solo se valorizzato. */
export function validatePhone(value: string): string | undefined {
    if (!value.trim()) return undefined;
    return PHONE_PATTERN.test(value) ? undefined : "Formato telefono non valido.";
}

/**
 * Regole della password, condivise fra la registrazione e il cambio password.
 * Sono le nostre: Firebase da solo pretende soltanto sei caratteri, e rifiuta
 * il resto con `auth/weak-password` a richiesta già partita.
 */
export function validatePassword(value: string): string | undefined {
    if (!value) return "La password è obbligatoria.";
    if (value.length < 8) return "La password deve avere almeno 8 caratteri.";
    if (!/[A-Z]/.test(value) || !/[0-9]/.test(value))
        return "Deve contenere almeno una maiuscola e un numero.";
    return undefined;
}

/** Anche il codice fiscale è opzionale. */
export function validateCodiceFiscale(value: string): string | undefined {
    if (!value.trim()) return undefined;
    return CODICE_FISCALE_PATTERN.test(value)
        ? undefined
        : "Il codice fiscale deve avere 16 caratteri alfanumerici.";
}
