import { getDashboardStats, getRecentTransactions, getMonthlySummaries } from "@/actions/transactions";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { MonthlyCards } from "@/components/dashboard/monthly-cards";

export default async function DashboardPage() {
  const [stats, recent, summaries] = await Promise.all([
    getDashboardStats(),
    getRecentTransactions(8),
    getMonthlySummaries(),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of your business transactions</p>
      </div>

      <StatsCards stats={stats} />

      <MonthlyCards summaries={summaries} />

      <RecentTransactions transactions={recent} />
    </div>
  );
}
