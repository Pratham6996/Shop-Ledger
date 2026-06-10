"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { formatCurrency, formatMonthYear, toCSV, formatDate } from "@/lib/format";
import { getAllTransactionsForExport } from "@/actions/transactions";
import { toast } from "sonner";
import type { MonthlySummary } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ReportsClientProps {
  summaries: MonthlySummary[];
  totalReceived: number;
  totalSent: number;
  netBalance: number;
}

export function ReportsClient({ summaries, totalReceived, totalSent, netBalance }: ReportsClientProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    const { data, error } = await getAllTransactionsForExport({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    setExporting(false);

    if (error) { toast.error("Export failed: " + error); return; }
    if (data.length === 0) { toast.info("No transactions in selected range."); return; }

    const rows = data.map((t) => ({
      Date: formatDate(t.date),
      Direction: t.direction,
      Counterparty: t.counterparty,
      Amount: t.amount,
      Fees: t.fees ?? 0,
      "Net Amount": t.amount - (t.fees ?? 0),
      Description: t.description ?? "",
      Reference: t.transaction_reference ?? "",
      Notes: t.notes ?? "",
    }));

    const csv = toCSV(rows as Record<string, unknown>[]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const suffix = dateFrom && dateTo ? `${dateFrom}-to-${dateTo}` : new Date().toISOString().split("T")[0];
    a.download = `transactions-${suffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} transactions`);
  }

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-gray-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500">All-Time Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceived)}</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500">All-Time Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSent)}</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn("text-2xl font-bold", netBalance >= 0 ? "text-green-600" : "text-red-600")}>
              {formatCurrency(netBalance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card className="border border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Export Transactions</CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">Download your transactions as a CSV file. Optionally filter by date range.</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <Button onClick={handleExport} disabled={exporting} className="gap-2">
              <Download className="w-4 h-4" />
              {exporting ? "Exporting…" : "Download CSV"}
            </Button>
            {(dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={() => { setDateFrom(""); setDateTo(""); }}>
                Clear dates
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Monthly Breakdown</h2>
        {summaries.length === 0 ? (
          <p className="text-sm text-gray-400">No data yet.</p>
        ) : (
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600">Month</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600">Received</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600">Sent</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600">Net</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {summaries.map((s) => (
                  <tr key={`${s.year}-${s.month}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-800">
                      {formatMonthYear(s.month, s.year)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-green-600 font-medium">
                      {formatCurrency(s.totalReceived)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-red-600 font-medium">
                      {formatCurrency(s.totalSent)}
                    </td>
                    <td className={cn("px-4 py-2.5 text-right font-semibold", s.netBalance >= 0 ? "text-green-600" : "text-red-600")}>
                      {formatCurrency(s.netBalance)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-400">{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
