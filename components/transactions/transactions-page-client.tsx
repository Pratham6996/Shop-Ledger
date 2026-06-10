"use client";

import { useState, useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TransactionFilterBar } from "./transaction-filters";
import { TransactionTable } from "./transaction-table";
import { Plus, Download } from "lucide-react";
import { TransactionForm } from "./transaction-form";
import { getAllTransactionsForExport } from "@/actions/transactions";
import { toCSV, formatDate } from "@/lib/format";
import type { Transaction, TransactionFilters } from "@/lib/types";
import { toast } from "sonner";

interface TransactionsPageClientProps {
  initialTransactions: Transaction[];
  initialCount: number;
  fetchTransactions: (filters: TransactionFilters, page: number) => Promise<{ data: Transaction[]; count: number }>;
}

const PAGE_SIZE = 20;

export function TransactionsPageClient({
  initialTransactions,
  initialCount,
  fetchTransactions,
}: TransactionsPageClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [count, setCount] = useState(initialCount);
  const [filters, setFilters] = useState<TransactionFilters>({ direction: "all" });
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [exporting, setExporting] = useState(false);

  const load = useCallback(
    (newFilters: TransactionFilters, newPage: number) => {
      startTransition(async () => {
        const result = await fetchTransactions(newFilters, newPage);
        setTransactions(result.data);
        setCount(result.count);
      });
    },
    [fetchTransactions]
  );

  function handleFiltersChange(newFilters: TransactionFilters) {
    setFilters(newFilters);
    setPage(1);
    load(newFilters, 1);
  }

  function handleRefresh() {
    load(filters, page);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    load(filters, newPage);
  }

  async function handleExport() {
    setExporting(true);
    const { data, error } = await getAllTransactionsForExport(filters);
    setExporting(false);

    if (error) {
      toast.error("Export failed: " + error);
      return;
    }

    if (data.length === 0) {
      toast.info("No transactions to export.");
      return;
    }

    const rows = data.map((t) => ({
      Date: formatDate(t.date),
      Direction: t.direction,
      Counterparty: t.counterparty,
      Amount: t.amount,
      Fees: t.fees ?? 0,
      Description: t.description ?? "",
      Reference: t.transaction_reference ?? "",
      Notes: t.notes ?? "",
    }));

    const csv = toCSV(rows as Record<string, unknown>[]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} transactions`);
  }

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <TransactionFilterBar filters={filters} onChange={handleFiltersChange} />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
            className="gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400">
        {isPending ? "Loading…" : `${count} transaction${count !== 1 ? "s" : ""}`}
      </p>

      {/* Table */}
      <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
        <TransactionTable transactions={transactions} onRefresh={handleRefresh} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm
            onSuccess={() => {
              setAddOpen(false);
              setPage(1);
              load(filters, 1);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
