"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Transaction, TransactionFilters, MonthlySummary, DashboardStats } from "@/lib/types";

const transactionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  direction: z.enum(["received", "sent"]),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  counterparty: z.string().min(1, "Counterparty is required"),
  description: z.string().optional().nullable(),
  transaction_reference: z.string().optional().nullable(),
  fees: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export async function getTransactions(
  filters: TransactionFilters = {},
  page = 1,
  pageSize = 20
): Promise<{ data: Transaction[]; count: number; error?: string }> {
  const supabase = await createClient();

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.search) {
    query = query.ilike("counterparty", `%${filters.search}%`);
  }
  if (filters.direction && filters.direction !== "all") {
    query = query.eq("direction", filters.direction);
  }
  if (filters.dateFrom) {
    query = query.gte("date", filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte("date", filters.dateTo);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) return { data: [], count: 0, error: error.message };
  return { data: data as Transaction[], count: count ?? 0 };
}

export async function getAllTransactionsForExport(
  filters: TransactionFilters = {}
): Promise<{ data: Transaction[]; error?: string }> {
  const supabase = await createClient();

  let query = supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (filters.search) query = query.ilike("counterparty", `%${filters.search}%`);
  if (filters.direction && filters.direction !== "all") query = query.eq("direction", filters.direction);
  if (filters.dateFrom) query = query.gte("date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("date", filters.dateTo);

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };
  return { data: data as Transaction[] };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("transactions")
    .select("direction, amount, fees");

  if (!data) return { totalReceived: 0, totalSent: 0, netBalance: 0, transactionCount: 0 };

  let totalReceived = 0;
  let totalSent = 0;

  for (const t of data) {
    const net = (t.amount ?? 0) - (t.fees ?? 0);
    if (t.direction === "received") totalReceived += net;
    else totalSent += net;
  }

  return {
    totalReceived,
    totalSent,
    netBalance: totalReceived - totalSent,
    transactionCount: data.length,
  };
}

export async function getRecentTransactions(limit = 5): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Transaction[]) ?? [];
}

export async function getMonthlySummaries(): Promise<MonthlySummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select("date, direction, amount, fees")
    .order("date", { ascending: false });

  if (!data) return [];

  const map = new Map<string, MonthlySummary>();

  for (const t of data) {
    const [year, month] = t.date.split("-");
    const key = `${year}-${month}`;

    if (!map.has(key)) {
      map.set(key, { month, year: parseInt(year), totalReceived: 0, totalSent: 0, netBalance: 0, count: 0 });
    }

    const entry = map.get(key)!;
    const net = (t.amount ?? 0) - (t.fees ?? 0);
    if (t.direction === "received") entry.totalReceived += net;
    else entry.totalSent += net;
    entry.netBalance = entry.totalReceived - entry.totalSent;
    entry.count += 1;
  }

  return Array.from(map.values());
}

export async function createTransaction(
  formData: TransactionFormData
): Promise<{ error?: string }> {
  const parsed = transactionSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").insert([parsed.data]);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/reports");
  return {};
}

export async function updateTransaction(
  id: string,
  formData: TransactionFormData
): Promise<{ error?: string }> {
  const parsed = transactionSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/reports");
  return {};
}

export async function deleteTransaction(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/reports");
  return {};
}
