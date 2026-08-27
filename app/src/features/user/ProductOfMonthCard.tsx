import { useProductOfTheMonth } from "./hooks";
import { ProductCard } from "./ProductCard";
import { Card } from "../../components/Card";
import { Loading } from "../../components/Loading";
import { errorMessage, isNotFound } from "../../lib/errorMessage";

export function ProductOfMonthCard() {
    const { data, isLoading, isError, error } = useProductOfTheMonth();

    if (isLoading) return <Card><Loading label="Caricamento prodotto del mese..." /></Card>;
    // Il 404 e' l'assenza di acquisti, non un guasto: solo quello va raccontato
    // come stato vuoto, il resto resta un errore.
    if (isError && isNotFound(error))
        return <Card className="text-fg-muted">Nessun prodotto trovato per questo mese.</Card>;
    if (isError)
        return <Card className="text-danger">{errorMessage(error, "Non è stato possibile caricare il prodotto del mese.")}</Card>;
    if (!data) return <Card className="text-fg-muted">Nessun prodotto trovato.</Card>;

    return <ProductCard title="Prodotto del mese" product={data} />;
}
