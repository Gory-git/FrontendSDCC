import type { ProductDTO } from "../../api/types";

type ProductCardProps = {
    title: string;
    product: ProductDTO;
};

export function ProductCard({ title, product }: ProductCardProps) {
    const formattedPrice = new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
    }).format(Number(product.price));

    return (
        <div className="rounded-xl border p-4 space-y-2">
            <h2 className="text-xl font-semibold">{title}</h2>
            <div>
                <p><strong>Nome:</strong> {product.name}</p>
                <p><strong>Codice:</strong> {product.code}</p>
                <p><strong>Prezzo:</strong> {formattedPrice}</p>
            </div>
        </div>
    );
}
