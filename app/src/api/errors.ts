/**
 * Tipi d'errore in un modulo a se' stante: `queryClient.ts` deve poterli
 * ispezionare per decidere i retry, e importarli da `client.ts` creerebbe un
 * ciclo (client -> auth-client -> queryClient -> client).
 */

export class ApiError extends Error {
    readonly status: number;
    readonly body: unknown;

    constructor(message: string, status: number, body?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.body = body;
    }
}

export class AuthError extends Error {
    constructor(message = "Failed to retrieve authentication token") {
        super(message);
        this.name = "AuthError";
    }
}
