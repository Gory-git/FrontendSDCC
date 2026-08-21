import { getBearerToken } from "../auth/auth-client";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

// ─── Error Types ────────────────────────────────────────────────────────────

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

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns true only for plain JSON bodies.
 * Prevents incorrectly setting Content-Type on FormData / URLSearchParams.
 */
function isPlainObject(body: BodyInit | null | undefined): boolean {
    return typeof body === "string";
}

/**
 * Safely parse a response body regardless of Content-Type.
 * Returns { data, isJson } so callers know what they got.
 */
async function parseBody(
    response: Response
): Promise<{ data: unknown; isJson: boolean }> {
    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    try {
        if (isJson) return { data: await response.json(), isJson: true };

        // Capture plain-text error bodies (Spring whitelabel, etc.)
        const text = await response.text();
        return { data: text || null, isJson: false };
    } catch {
        // Body consumption failed — return null rather than crash
        return { data: null, isJson: false };
    }
}

// ─── Core Fetch ─────────────────────────────────────────────────────────────

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    // 1. Resolve auth token — wrap failures so callers get a typed error
    let token: string | null = null;
    try {
        token = await getBearerToken();
    } catch (cause) {
        throw new AuthError(
            cause instanceof Error ? cause.message : undefined
        );
    }

    // 2. Build headers — never force Content-Type on FormData/URLSearchParams
    const headers: HeadersInit = {
        Accept: "application/json",
        ...(isPlainObject(options.body)
            ? { "Content-Type": "application/json" }
            : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers, // caller overrides win
    };

    // 3. Execute request
    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers,
        });
    } catch (cause) {
        // Network-level failure (DNS, CORS preflight crash, offline, etc.)
        throw new ApiError(
            cause instanceof Error ? cause.message : "Network error",
            0 // No HTTP status available
        );
    }

    // 4. Empty body — return early before attempting to parse
    if (response.status === 204) {
        return undefined as T;
    }

    // 5. Parse response body once (fetch body can only be consumed once)
    const { data, isJson } = await parseBody(response);

    // 6. Error path
    if (!response.ok) {
        const message =
            isJson && data && typeof data === "object"
                ? ((data as Record<string, unknown>).message as string) ??
                `HTTP ${response.status}`
                : typeof data === "string" && data.length > 0
                    ? data
                    : `HTTP ${response.status}`;

        throw new ApiError(message, response.status, data);
    }

    // 7. Happy path
    return data as T;
}
