import { PageContainer } from "../src/components/PageContainer";
import UserPage from "../src/features/user/UserPage";
import { ProductOfMonthCard } from "../src/features/user/ProductOfMonthCard";
import { ProductByRangeForm } from "../src/features/user/ProductByRangeForm";

export default function DashboardPage() {
  return (
    <PageContainer>
      <UserPage />
      <ProductOfMonthCard />
      <ProductByRangeForm />
    </PageContainer>
  );
}
