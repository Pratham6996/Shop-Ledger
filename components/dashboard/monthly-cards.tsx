import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import type { MonthlySummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MonthlyCards({ summaries }: { summaries: MonthlySummary[] }) {
  const recent = summaries.slice(0, 4);

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Monthly Summary</h2>
      {recent.length === 0 ? (
        <p className="text-sm text-gray-400">No data yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {recent.map((s) => (
            <Card key={`${s.year}-${s.month}`} className="border border-gray-200 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-500">
                  {formatMonthYear(s.month, s.year)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">In</span>
                  <span className="text-green-600 font-medium">{formatCurrency(s.totalReceived)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Out</span>
                  <span className="text-red-600 font-medium">{formatCurrency(s.totalSent)}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-gray-100">
                  <span className="text-gray-700 font-medium">Net</span>
                  <span
                    className={cn(
                      "font-semibold",
                      s.netBalance >= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {formatCurrency(s.netBalance)}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{s.count} transactions</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
