import { useEffect, useState } from "react";
import { observeAuth } from "./auth-client";
import type { User } from "firebase/auth";

/**
 * `undefined` while the initial Firebase auth check is in flight,
 * `null` once resolved with no signed-in user.
 */
export function useAuthUser(): User | null | undefined {
    const [user, setUser] = useState<User | null | undefined>(undefined);

    useEffect(() => {
        return observeAuth(setUser);
    }, []);

    return user;
}
