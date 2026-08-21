import type { ProductDTO } from "../../api/types";
import { Card } from "../../components/Card";

type ProductCardProps = {
    title: string;
    product: ProductDTO;
};

export function ProductCard({ title, product }: ProductCardProps) {
    return (
        <Card className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="text-slate-700"><span className="text-slate-500">Nome:</span> {product.name}</p>
            <p className="text-slate-700"><span className="text-slate-500">Codice:</span> {product.code}</p>
        </Card>
    );
}
