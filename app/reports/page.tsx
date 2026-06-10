import { getDashboardStats, getMonthlySummaries } from "@/actions/transactions";
import { ReportsClient } from "@/components/reports/reports-client";

export default async function ReportsPage() {
  const [stats, summaries] = await Promise.all([
    getDashboardStats(),
    getMonthlySummaries(),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Monthly summaries and CSV export</p>
      </div>

      <ReportsClient
        summaries={summaries}
        totalReceived={stats.totalReceived}
        totalSent={stats.totalSent}
        netBalance={stats.netBalance}
      />
    </div>
  );
}
