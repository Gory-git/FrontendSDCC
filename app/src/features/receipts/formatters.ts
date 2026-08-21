import type { PaymentMethod } from "../../api/types";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
    CASH: "Contanti",
    CREDIT_CARD: "Carta di credito",
    DEBIT_CARD: "Carta di debito",
    PAYPAL: "PayPal",
    BANK_TRANSFER: "Bonifico",
};

export const currencyFormatter = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
});

export function formatDate(iso: string): string {
    return new Intl.DateTimeFormat("it-IT", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(iso));
}
