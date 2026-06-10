import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { ArrowRight } from "lucide-react";

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card className="border border-gray-200 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold text-gray-900">Recent Transactions</CardTitle>
        <Link
          href="/transactions"
          className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent className="px-0">
        {transactions.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            No transactions yet. Add your first one!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((t) => (
              <div key={t.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Badge
                    variant="outline"
                    className={
                      t.direction === "received"
                        ? "border-green-200 text-green-700 bg-green-50 text-xs"
                        : "border-red-200 text-red-700 bg-red-50 text-xs"
                    }
                  >
                    {t.direction === "received" ? "In" : "Out"}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.counterparty}</p>
                    {t.description && (
                      <p className="text-xs text-gray-400 truncate">{t.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p
                    className={`text-sm font-semibold ${
                      t.direction === "received" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.direction === "received" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(t.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
