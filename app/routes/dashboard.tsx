import { Link } from "react-router";
import UserPage from "../src/features/user/UserPage";
import { ProductOfMonthCard } from "../src/features/user/ProductOfMonthCard";
import { ProductByRangeForm } from "../src/features/user/ProductByRangeForm";

export default function DashboardPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/receipts" className="rounded bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200">
            Vedi ricevute
          </Link>
          <Link to="/receipts/new" className="rounded bg-black text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
            Nuova ricevuta
          </Link>
        </div>
      </div>
      <UserPage />
      <ProductOfMonthCard />
      <ProductByRangeForm />
    </main>
  );
}
