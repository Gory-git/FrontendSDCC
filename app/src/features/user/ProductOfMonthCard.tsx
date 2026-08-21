import { useProductOfTheMonth } from "./hooks";
import { ProductCard } from "./ProductCard";
import { Card } from "../../components/Card";

export function ProductOfMonthCard() {
    const { data, isLoading, isError, error } = useProductOfTheMonth();

    if (isLoading) return <Card className="text-slate-500">Caricamento prodotto del mese...</Card>;
    if (isError) return <Card className="text-slate-500">Nessun prodotto trovato per questo mese.</Card>;
    if (!data) return <Card className="text-slate-500">Nessun prodotto trovato.</Card>;

    return <ProductCard title="Prodotto del mese" product={data} />;
}
