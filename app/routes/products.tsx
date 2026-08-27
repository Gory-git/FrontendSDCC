import { useState } from "react";
import { useCurrentUser } from "../src/features/user/hooks";
import {
    useAddProduct,
    useAllProducts,
    useDeleteProduct,
    useProductOfTheMonthForUser,
    useProductOfTimeSpanForUser,
    useProductSearch,
} from "../src/features/products/hooks";
import { PageContainer } from "../src/components/PageContainer";
import { Loading, ReceiptSpinner } from "../src/components/Loading";
import { errorMessage } from "../src/lib/errorMessage";
import { Card } from "../src/components/Card";
import { Field } from "../src/components/Field";
import { Button } from "../src/components/Button";
import { DateField } from "../src/components/DateField";
import { ThresholdSlider } from "../src/components/ThresholdSlider";
import { ProductCard } from "../src/features/user/ProductCard";
import { APP_MIN_DATE, daysAgoDateString, endOfDayIsoClamped, startOfDayIso, todayDateString } from "../src/lib/dateInput";
import type { ProductDTO } from "../src/api/types";

function AddProductForm() {
    const addProduct = useAddProduct();
    const [name, setName] = useState("");
    const [code, setCode] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        addProduct.mutate(
            { name, code },
            { onSuccess: () => { setName(""); setCode(""); } }
        );
    }

    return (
        <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-fg">Aggiungi prodotto</h2>
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[160px]">
                    <Field id="productName" label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="flex-1 min-w-[160px]">
                    <Field id="productCode" label="Codice" value={code} onChange={(e) => setCode(e.target.value)} required />
                </div>
                <Button type="submit" disabled={addProduct.isPending}>
                    {addProduct.isPending ? <><ReceiptSpinner size="sm" />Salvataggio...</> : "Aggiungi"}
                </Button>
            </form>
            {addProduct.isError && (
                <p className="text-sm text-danger">{errorMessage(addProduct.error, "Non è stato possibile aggiungere il prodotto.")}</p>
            )}
            {addProduct.isSuccess && (
                <p className="text-sm text-success">Prodotto aggiunto.</p>
            )}
        </Card>
    );
}

function UserProductStats() {
    const [email, setEmail] = useState("");
    const [dateMinInput, setDateMinInput] = useState(() => daysAgoDateString(30));
    const [dateMaxInput, setDateMaxInput] = useState(todayDateString);
    const [submittedRange, setSubmittedRange] = useState<{ dateMin?: string; dateMax?: string }>({});

    const monthQuery = useProductOfTheMonthForUser(email.trim());
    const rangeQuery = useProductOfTimeSpanForUser(email.trim(), submittedRange.dateMin, submittedRange.dateMax);

    function handleRangeSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!dateMinInput || !dateMaxInput) return;
        setSubmittedRange({
            dateMin: startOfDayIso(dateMinInput),
            dateMax: endOfDayIsoClamped(dateMaxInput),
        });
    }

    return (
        <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-fg">Statistiche prodotto per utente</h2>
            <Field
                id="statsEmail"
                label="Email utente"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mario.rossi@email.com"
            />

            {email.trim() !== "" && (
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold text-fg-secondary mb-2">Ultimi 30 giorni</p>
                        {monthQuery.isLoading && <Loading />}
                        {monthQuery.isError && <p className="text-sm text-fg-muted">Nessun prodotto trovato.</p>}
                        {monthQuery.data && <ProductCard title="Prodotto del mese" product={monthQuery.data} />}
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-fg-secondary">Intervallo personalizzato</p>
                        <form onSubmit={handleRangeSubmit} className="flex flex-wrap gap-4 items-end">
                            <DateField
                                id="dateMin"
                                label="Data iniziale"
                                value={dateMinInput}
                                onChange={(e) => setDateMinInput(e.target.value)}
                                min={APP_MIN_DATE}
                                max={dateMaxInput || todayDateString()}
                            />
                            <DateField
                                id="dateMax"
                                label="Data finale"
                                value={dateMaxInput}
                                onChange={(e) => setDateMaxInput(e.target.value)}
                                min={dateMinInput || APP_MIN_DATE}
                                max={todayDateString()}
                            />
                            <Button type="submit" variant="secondary">Cerca</Button>
                        </form>

                        {rangeQuery.isLoading && <Loading />}
                        {rangeQuery.isError && <p className="text-sm text-fg-muted">Nessun prodotto trovato nell'intervallo.</p>}
                        {rangeQuery.data && <ProductCard title="Prodotto trovato" product={rangeQuery.data} />}
                    </div>
                </div>
            )}
        </Card>
    );
}

function ProductList({ products, isAdmin, onDelete, deletePending }: {
    products: ProductDTO[] | undefined;
    isAdmin: boolean;
    onDelete: (code: string) => void;
    deletePending: boolean;
}) {
    return (
        <div className="grid sm:grid-cols-2 gap-3">
            {products?.map((product) => (
                <div key={product.code} className="flex items-center justify-between gap-3 rounded-lg border border-line p-3">
                    <div>
                        <p className="font-medium text-fg">{product.name}</p>
                        <p className="text-sm text-fg-muted">{product.code}</p>
                    </div>
                    {isAdmin && (
                        <Button
                            variant="danger"
                            className="px-3 py-1.5 text-xs shrink-0"
                            onClick={() => onDelete(product.code)}
                            disabled={deletePending}
                        >
                            Elimina
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function ProductsPage() {
    const { data: currentUser } = useCurrentUser();
    const isAdmin = currentUser?.role === "ROLE_ADMIN";

    const [search, setSearch] = useState("");
    const [threshold, setThreshold] = useState(0.5);
    const isSearching = search.trim() !== "";

    const allProducts = useAllProducts();
    const searchResults = useProductSearch(search.trim(), threshold, isSearching);
    const deleteProduct = useDeleteProduct();

    const { data: products, isLoading, isError, error } = isSearching ? searchResults : allProducts;

    function handleDelete(code: string) {
        if (!window.confirm(`Eliminare il prodotto "${code}"? L'operazione non è reversibile.`)) return;
        deleteProduct.mutate(code);
    }

    return (
        <PageContainer>
            <h1 className="text-2xl font-bold text-fg">Prodotti</h1>

            {isAdmin && <AddProductForm />}

            <Card className="space-y-4">
                <Field
                    id="productFilter"
                    label="Cerca per nome o codice"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="es. Pasta"
                />
                <ThresholdSlider id="productThreshold" value={threshold} onChange={setThreshold} />

                {isLoading && <Loading label="Caricamento prodotti..." />}
                {isError && <p className="text-sm text-danger">{errorMessage(error, "Non è stato possibile caricare i prodotti.")}</p>}
                {!isLoading && !isError && products?.length === 0 && (
                    <p className="text-sm text-fg-muted">
                        {isSearching ? "Nessun prodotto corrisponde alla ricerca." : "Nessun prodotto trovato."}
                    </p>
                )}
                {deleteProduct.isError && (
                    <p className="text-sm text-danger">{errorMessage(deleteProduct.error, "Non è stato possibile eliminare il prodotto.")}</p>
                )}

                <ProductList
                    products={products}
                    isAdmin={isAdmin}
                    onDelete={handleDelete}
                    deletePending={deleteProduct.isPending}
                />
            </Card>

            {isAdmin && <UserProductStats />}
        </PageContainer>
    );
}
