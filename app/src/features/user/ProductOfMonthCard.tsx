import { useProductOfTheMonth } from "./hooks";
import { ProductCard } from "./ProductCard";

export function ProductOfMonthCard() {
    const { data, isLoading, isError, error } = useProductOfTheMonth();

    if (isLoading) return <p>Caricamento prodotto del mese...</p>;
    if (isError) return <p>Errore: {(error as Error).message}</p>;
    if (!data) return <p>Nessun prodotto trovato.</p>;

    return <ProductCard title="Prodotto del mese" product={data} />;
}
