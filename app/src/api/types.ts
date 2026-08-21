export type UserDTO = {
    name: string;
    surname: string;
    email: string;
    phone: string;
    role: string;
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
