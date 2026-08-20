export type UserDTO = {
    name: string;
    surname: string;
    email: string;
    phone: string;
    birthDate: string;
    role: string;
};

export type ProductDTO = {
    name: string;
    code: string;
    price: string;
};

export type ResponseMessage = {
    message: string;
};
