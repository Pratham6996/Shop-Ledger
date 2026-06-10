"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteTransaction } from "@/actions/transactions";
import { TransactionForm } from "./transaction-form";
import { toast } from "sonner";
import type { Transaction } from "@/lib/types";

interface TransactionTableProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

export function TransactionTable({ transactions, onRefresh }: TransactionTableProps) {
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    const result = await deleteTransaction(deleting.id);
    setDeleteLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Transaction deleted");
      setDeleting(null);
      onRefresh();
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-gray-400">
        No transactions found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-600">Date</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Direction</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Counterparty</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 text-right">Amount</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 text-right">Fees</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Description</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Reference</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id} className="hover:bg-gray-50">
                <TableCell className="text-sm text-gray-700 whitespace-nowrap">
                  {formatDate(t.date)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      t.direction === "received"
                        ? "border-green-200 text-green-700 bg-green-50 text-xs"
                        : "border-red-200 text-red-700 bg-red-50 text-xs"
                    }
                  >
                    {t.direction === "received" ? "↓ Received" : "↑ Sent"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-medium text-gray-900">
                  {t.counterparty}
                </TableCell>
                <TableCell className="text-sm text-right font-semibold whitespace-nowrap">
                  <span className={t.direction === "received" ? "text-green-600" : "text-red-600"}>
                    {t.direction === "received" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-right text-gray-500">
                  {t.fees ? formatCurrency(t.fees) : "—"}
                </TableCell>
                <TableCell className="text-sm text-gray-500 max-w-[180px] truncate">
                  {t.description || "—"}
                </TableCell>
                <TableCell className="text-xs text-gray-400 font-mono">
                  {t.transaction_reference || "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setEditing(t)}
                    >
                      <Pencil className="w-3.5 h-3.5 text-gray-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setDeleting(t)}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(o: boolean) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editing && (
            <TransactionForm
              transaction={editing}
              onSuccess={() => {
                setEditing(null);
                onRefresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o: boolean) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the transaction with{" "}
              <strong>{deleting?.counterparty}</strong> for{" "}
              {deleting && formatCurrency(deleting.amount)}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
