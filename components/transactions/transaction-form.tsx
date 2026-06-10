"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTransaction, updateTransaction } from "@/actions/transactions";
import type { Transaction } from "@/lib/types";
import { toast } from "sonner";
import { useState } from "react";

const schema = z.object({
  date: z.string().min(1, "Date is required"),
  direction: z.enum(["received", "sent"], { message: "Direction is required" }),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  counterparty: z.string().min(1, "Counterparty is required"),
  description: z.string().optional(),
  transaction_reference: z.string().optional(),
  fees: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type FormData = {
  date: string;
  direction: "received" | "sent";
  amount: number;
  counterparty: string;
  description?: string;
  transaction_reference?: string;
  fees?: number;
  notes?: string;
};

interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess?: () => void;
}

export function TransactionForm({ transaction, onSuccess }: TransactionFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: {
      date: transaction?.date ?? new Date().toISOString().split("T")[0],
      direction: transaction?.direction ?? undefined,
      amount: transaction?.amount ?? undefined,
      counterparty: transaction?.counterparty ?? "",
      description: transaction?.description ?? "",
      transaction_reference: transaction?.transaction_reference ?? "",
      fees: transaction?.fees ?? 0,
      notes: transaction?.notes ?? "",
    },
  });

  const directionValue = watch("direction");

  async function onSubmit(data: FormData) {
    setLoading(true);
    const result = transaction
      ? await updateTransaction(transaction.id, data)
      : await createTransaction(data);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(transaction ? "Transaction updated" : "Transaction added");
      onSuccess?.();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div className="space-y-1.5">
          <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
        </div>

        {/* Direction */}
        <div className="space-y-1.5">
          <Label>Direction <span className="text-red-500">*</span></Label>
          <Select
            value={directionValue}
            onValueChange={(v: string | null) => v && setValue("direction", v as "received" | "sent", { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="received">Received (Money In)</SelectItem>
              <SelectItem value="sent">Sent (Money Out)</SelectItem>
            </SelectContent>
          </Select>
          {errors.direction && <p className="text-xs text-red-500">{errors.direction.message}</p>}
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount (₹) <span className="text-red-500">*</span></Label>
          <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register("amount")} />
          {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
        </div>

        {/* Counterparty */}
        <div className="space-y-1.5">
          <Label htmlFor="counterparty">Counterparty <span className="text-red-500">*</span></Label>
          <Input id="counterparty" placeholder="Name / Company" {...register("counterparty")} />
          {errors.counterparty && <p className="text-xs text-red-500">{errors.counterparty.message}</p>}
        </div>

        {/* Fees */}
        <div className="space-y-1.5">
          <Label htmlFor="fees">Fees (₹)</Label>
          <Input id="fees" type="number" step="0.01" placeholder="0.00" {...register("fees")} />
        </div>

        {/* Reference */}
        <div className="space-y-1.5">
          <Label htmlFor="transaction_reference">Transaction Reference</Label>
          <Input id="transaction_reference" placeholder="UTR / Ref no." {...register("transaction_reference")} />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Input id="description" placeholder="Brief description" {...register("description")} />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Any additional notes…"
          {...register("notes")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : transaction ? "Update Transaction" : "Add Transaction"}
        </Button>
      </div>
    </form>
  );
}
