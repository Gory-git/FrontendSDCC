import { useState } from "react";
import { Link } from "react-router";
import { useAllUsers, useUsersByEmail } from "../src/features/user/hooks";
import { PageContainer } from "../src/components/PageContainer";
import { Card } from "../src/components/Card";
import { Field } from "../src/components/Field";
import { ThresholdSlider } from "../src/components/ThresholdSlider";
import type { UserDTO } from "../src/api/types";

export default function AdminUsersPage() {
    const [search, setSearch] = useState("");
    const [threshold, setThreshold] = useState(0.5);
    const isSearching = search.trim() !== "";

    const allUsers = useAllUsers();
    const searchResults = useUsersByEmail(search.trim(), threshold, isSearching);

    const { data: users, isLoading, isError, error } = isSearching ? searchResults : allUsers;

    return (
        <PageContainer>
            <h1 className="text-2xl font-bold text-slate-900">Utenti</h1>

            <Card className="space-y-4">
                <Field
                    id="search"
                    label="Cerca per email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="mario.rossi@email.com"
                />
                <ThresholdSlider id="threshold" value={threshold} onChange={setThreshold} />
            </Card>

            {isLoading && <p className="text-slate-500">Caricamento utenti...</p>}
            {isError && <p className="text-red-600">Errore: {(error as Error).message}</p>}
            {!isLoading && !isError && users?.length === 0 && (
                <p className="text-slate-500">
                    {isSearching ? "Nessun utente corrisponde alla ricerca." : "Nessun utente trovato."}
                </p>
            )}

            <UserList users={users} />
        </PageContainer>
    );
}

function UserList({ users }: { users: UserDTO[] | undefined }) {
    return (
        <div className="space-y-3">
            {users?.map((user) => (
                <Link key={user.email} to={`/admin/users/${encodeURIComponent(user.email)}`}>
                    <Card className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                        <div>
                            <p className="font-semibold text-slate-900">{user.name} {user.surname}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                        <span className="text-xs font-medium uppercase tracking-wide text-brand">
                            {user.role === "ROLE_ADMIN" ? "Admin" : "Utente"}
                        </span>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
