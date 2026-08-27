/**
 * Dell'intero numero di carta l'applicazione conserva e trasmette soltanto le
 * ultime quattro cifre. Chi cerca o inserisce può digitare il numero completo:
 * viene ridotto qui, nel browser, prima che parta la richiesta — così un numero
 * di carta non finisce mai in una query string né nei log del server.
 *
 * La stessa riduzione la rifà il backend (`CardValidator`): questa è comodità
 * per chi scrive, quella è la garanzia.
 */

/** Le ultime quattro cifre di quello che è stato digitato, o "" se sono meno di quattro. */
export function lastFourDigits(input: string): string {
    const cifre = input.replace(/\D/g, "");
    return cifre.length < 4 ? "" : cifre.slice(-4);
}

/**
 * Il controllo di Luhn, qui e non solo nel backend: il numero completo esiste
 * soltanto dentro questa pagina, perché di lì in poi viaggiano quattro cifre.
 * Se non lo si verificasse qui, un numero digitato male verrebbe accorciato in
 * silenzio e si salverebbero quattro cifre sbagliate. Il backend mantiene lo
 * stesso controllo come garanzia per chi chiama l'API direttamente.
 *
 * Con meno di 13 cifre non c'è niente da verificare (sono le ultime cifre, non
 * un numero intero) e si considera accettabile.
 */
export function isPlausibleCard(input: string): boolean {
    const cifre = input.replace(/\D/g, "");
    if (cifre.length < 13) return cifre.length === 0 || cifre.length >= 4;
    if (cifre.length > 19) return false;

    let somma = 0;
    let raddoppia = false;
    for (let i = cifre.length - 1; i >= 0; i--) {
        let cifra = cifre.charCodeAt(i) - 48;
        if (raddoppia) {
            cifra *= 2;
            if (cifra > 9) cifra -= 9;
        }
        somma += cifra;
        raddoppia = !raddoppia;
    }
    return somma % 10 === 0;
}

/** Per mostrare una carta in elenco: •••• 4242 */
export function formatCard(last4: string): string {
    return `•••• ${last4}`;
}
