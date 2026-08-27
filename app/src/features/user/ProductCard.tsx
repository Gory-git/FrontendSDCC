import type { ProductDTO } from "../../api/types";
import { Card } from "../../components/Card";

type ProductCardProps = {
    title: string;
    product: ProductDTO;
};

export function ProductCard({ title, product }: ProductCardProps) {
    return (
        <Card className="space-y-1">
            <h2 className="text-lg font-semibold text-fg">{title}</h2>
            <p className="text-fg-secondary"><span className="text-fg-muted">Nome:</span> {product.name}</p>
            <p className="text-fg-secondary"><span className="text-fg-muted">Codice:</span> {product.code}</p>
        </Card>
    );
}
