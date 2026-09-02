/**
 * Indicatore di robustezza della password, condiviso fra la registrazione e il
 * cambio password. È un aiuto visivo e basta: quello che rende una password
 * accettabile o no è `validatePassword`, non il punteggio mostrato qui.
 */

export function getStrength(password: string): { score: number; label: string; color: string } {
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

export function PasswordStrengthBar({ password }: { password: string }) {
    const { score, label, color } = getStrength(password);
    return (
        <div className="space-y-1">
            <div className="flex gap-1">
                {[0, 1, 2, 3].map(i => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i < score ? color : "bg-muted"
                        }`}
                    />
                ))}
            </div>
            <p className="text-xs text-fg-muted">{label}</p>
        </div>
    );
}
