export type UserDTO = {
    name: string;
    surname: string;
    email: string;
    phone: string;
    birthDate: string; // Instant Java -> string ISO
    role: string;
};

export type ResponseMessage = {
    message: string;
};

export type ProductDTO = {
    code: string;
    name: string;
    price: number;
};
