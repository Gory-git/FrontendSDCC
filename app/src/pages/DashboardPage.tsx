import { UserPage } from "../features/user/UserPage";
import { ProductOfMonthCard } from "../features/user/ProductOfMonthCard";
import { ProductByRangeForm } from "../features/user/ProductByRangeForm";

export function DashboardPage() {
    return (
        <div className="p-6 space-y-6">
            <UserPage />
            <ProductOfMonthCard />
            <ProductByRangeForm />
        </div>
    );
}
