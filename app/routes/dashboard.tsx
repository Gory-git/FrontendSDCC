import RequireAuth from "../src/auth/RequireAuth";
import UserPage from "../src/features/user/UserPage";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <UserPage />
      </main>
    </RequireAuth>
  );
}
