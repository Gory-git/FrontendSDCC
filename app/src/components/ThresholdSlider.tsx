type ThresholdSliderProps = {
    id: string;
    value: number;
    onChange: (value: number) => void;
};

/**
 * Soglia per le ricerche fuzzy lato backend (Jaro-Winkler similarity di
 * Apache Commons Text, valore in [0, 1] confrontato con `> threshold`):
 * 0 = qualsiasi somiglianza va bene, 1 = solo corrispondenza pressoché esatta.
 */
export function ThresholdSlider({ id, value, onChange }: ThresholdSliderProps) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-semibold text-fg-secondary">
                Soglia di somiglianza: {value.toFixed(2)}
            </label>
            <input
                id={id}
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="accent-brand"
            />
            <p className="text-xs text-fg-muted">
                Più alta è la soglia, più il risultato deve somigliare al testo cercato.
            </p>
        </div>
    );
}
