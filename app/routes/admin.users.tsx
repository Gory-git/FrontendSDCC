import { useState } from "react";
import { Link } from "react-router";
import { useAllUsers, useUserSearch } from "../src/features/user/hooks";
import { PageContainer } from "../src/components/PageContainer";
import { Loading } from "../src/components/Loading";
import { errorMessage } from "../src/lib/errorMessage";
import { Card } from "../src/components/Card";
import { Field } from "../src/components/Field";
import { ThresholdSlider } from "../src/components/ThresholdSlider";
import type { UserDTO } from "../src/api/types";

export default function AdminUsersPage() {
    const [search, setSearch] = useState("");
    const [threshold, setThreshold] = useState(0.5);
    const isSearching = search.trim() !== "";

    const allUsers = useAllUsers();
    const searchResults = useUserSearch(search.trim(), threshold, isSearching);

    const { data: users, isLoading, isError, error } = isSearching ? searchResults : allUsers;

    return (
        <PageContainer>
            <h1 className="text-2xl font-bold text-fg">Utenti</h1>

            <Card className="space-y-4">
                <Field
                    id="search"
                    label="Cerca per nome, cognome, email o codice fiscale"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Mario Rossi, mario.rossi@email.com, RSSMRA..."
                />
                <ThresholdSlider id="threshold" value={threshold} onChange={setThreshold} />
            </Card>

            {isLoading && <Loading label="Caricamento utenti..." />}
            {isError && <p className="text-danger">{errorMessage(error, "Non è stato possibile caricare gli utenti.")}</p>}
            {!isLoading && !isError && users?.length === 0 && (
                <p className="text-fg-muted">
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
                    <Card className="flex items-center justify-between p-4 hover:bg-muted transition-colors">
                        <div>
                            <p className="font-semibold text-fg">{user.name} {user.surname}</p>
                            <p className="text-sm text-fg-muted">{user.email}</p>
                            {user.codiceFiscale && (
                                <p className="text-xs text-fg-muted">{user.codiceFiscale}</p>
                            )}
                        </div>
                        <span className="text-xs font-medium uppercase tracking-wide text-brand-fg">
                            {user.role === "ROLE_ADMIN" ? "Admin" : "Utente"}
                        </span>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
