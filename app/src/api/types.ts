export type UserDTO = {
    name: string;
    surname: string;
    email: string;
    phone: string;
    codiceFiscale?: string;
    role: string;
};

/** Solo i campi che l'utente può modificare: email e ruolo non sono aggiornabili. */
export type UserUpdateDTO = {
    name: string;
    surname: string;
    phone?: string;
    codiceFiscale?: string;
};

export type ProductDTO = {
    name: string;
    code: string;
};

export type ResponseMessage = {
    message: string;
};

export type PaymentMethod =
    | "CASH"
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "PAYPAL"
    | "BANK_TRANSFER";

export type ReceiptLineDTO = {
    productCode: string;
    productName: string;
    quantity: number;
    price: number;
};

export type ReceiptDTO = {
    code: string;
    amount: number;
    tax: number;
    date: string;
    paymentMethod: PaymentMethod;
    userEmail: string;
    lines: ReceiptLineDTO[];
    s3Key?: string;
};

export type RevenuePointDTO = {
    date: string;
    total: number;
    count: number;
};

export type ProductStatDTO = {
    productCode: string;
    productName: string;
    quantity: number;
    revenue: number;
};

export type PaymentMethodStatDTO = {
    paymentMethod: PaymentMethod;
    count: number;
    total: number;
};

export type UserStatDTO = {
    email: string;
    name: string;
    surname: string;
    totalSpent: number;
    receiptCount: number;
};

export type SummaryStatsDTO = {
    totalRevenue: number;
    receiptCount: number;
    averageReceipt: number;
    userCount: number;
    adminCount: number;
};
