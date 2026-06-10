"use server";

import { sql } from "@/lib/db";
import { z } from "zod";
import { toDateString } from "@/lib/format";
import type { Transaction, TransactionFilters, MonthlySummary, DashboardStats } from "@/lib/types";

const transactionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  direction: z.enum(["received", "sent"], { message: "Direction is required" }),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  counterparty: z.string().min(1, "Counterparty is required"),
  description: z.string().optional().nullable(),
  transaction_reference: z.string().optional().nullable(),
  fees: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

function normalizeRows(rows: Record<string, unknown>[]): Transaction[] {
  return rows.map((r) => ({
    ...r,
    date: toDateString(r.date as string | Date),
    amount: Number(r.amount),
    fees: r.fees != null ? Number(r.fees) : null,
  })) as Transaction[];
}

export async function getTransactions(
  filters: TransactionFilters = {},
  page = 1,
  pageSize = 20
): Promise<{ data: Transaction[]; count: number; error?: string }> {
  try {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (filters.search) { conditions.push(`counterparty ILIKE $${i++}`); params.push(`%${filters.search}%`); }
    if (filters.direction && filters.direction !== "all") { conditions.push(`direction = $${i++}`); params.push(filters.direction); }
    if (filters.dateFrom) { conditions.push(`date >= $${i++}`); params.push(filters.dateFrom); }
    if (filters.dateTo) { conditions.push(`date <= $${i++}`); params.push(filters.dateTo); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const offset = (page - 1) * pageSize;

    const countResult = await sql.query(`SELECT COUNT(*) AS cnt FROM transactions ${where}`, params);
    const count = parseInt(String(countResult[0].cnt), 10);

    const dataResult = await sql.query(
      `SELECT * FROM transactions ${where} ORDER BY date DESC, created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      [...params, pageSize, offset]
    );

    return { data: normalizeRows(dataResult), count };
  } catch (e) {
    return { data: [], count: 0, error: String(e) };
  }
}

export async function getAllTransactionsForExport(
  filters: TransactionFilters = {}
): Promise<{ data: Transaction[]; error?: string }> {
  try {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (filters.search) { conditions.push(`counterparty ILIKE $${i++}`); params.push(`%${filters.search}%`); }
    if (filters.direction && filters.direction !== "all") { conditions.push(`direction = $${i++}`); params.push(filters.direction); }
    if (filters.dateFrom) { conditions.push(`date >= $${i++}`); params.push(filters.dateFrom); }
    if (filters.dateTo) { conditions.push(`date <= $${i++}`); params.push(filters.dateTo); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await sql.query(`SELECT * FROM transactions ${where} ORDER BY date DESC, created_at DESC`, params);
    return { data: normalizeRows(result) };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const result = await sql.query(`
      SELECT
        COALESCE(SUM(CASE WHEN direction='received' THEN amount - COALESCE(fees,0) ELSE 0 END), 0) AS total_received,
        COALESCE(SUM(CASE WHEN direction='sent'     THEN amount - COALESCE(fees,0) ELSE 0 END), 0) AS total_sent,
        COUNT(*) AS transaction_count
      FROM transactions
    `);
    const row = result[0];
    const totalReceived = parseFloat(String(row.total_received));
    const totalSent = parseFloat(String(row.total_sent));
    return { totalReceived, totalSent, netBalance: totalReceived - totalSent, transactionCount: parseInt(String(row.transaction_count), 10) };
  } catch {
    return { totalReceived: 0, totalSent: 0, netBalance: 0, transactionCount: 0 };
  }
}

export async function getRecentTransactions(limit = 8): Promise<Transaction[]> {
  try {
    const result = await sql.query(
      `SELECT * FROM transactions ORDER BY date DESC, created_at DESC LIMIT $1`,
      [limit]
    );
    return normalizeRows(result);
  } catch {
    return [];
  }
}

export async function getMonthlySummaries(): Promise<MonthlySummary[]> {
  try {
    const result = await sql.query(`
      SELECT
        TO_CHAR(date, 'MM') AS month,
        EXTRACT(YEAR FROM date)::int AS year,
        COALESCE(SUM(CASE WHEN direction='received' THEN amount - COALESCE(fees,0) ELSE 0 END), 0) AS total_received,
        COALESCE(SUM(CASE WHEN direction='sent'     THEN amount - COALESCE(fees,0) ELSE 0 END), 0) AS total_sent,
        COUNT(*) AS count
      FROM transactions
      GROUP BY TO_CHAR(date, 'MM'), EXTRACT(YEAR FROM date)
      ORDER BY year DESC, month DESC
    `);
    return result.map((r) => ({
      month: String(r.month),
      year: Number(r.year),
      totalReceived: parseFloat(String(r.total_received)),
      totalSent: parseFloat(String(r.total_sent)),
      netBalance: parseFloat(String(r.total_received)) - parseFloat(String(r.total_sent)),
      count: parseInt(String(r.count), 10),
    }));
  } catch {
    return [];
  }
}

export async function createTransaction(formData: TransactionFormData): Promise<{ error?: string }> {
  const parsed = transactionSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { date, direction, amount, counterparty, description, transaction_reference, fees, notes } = parsed.data;
  try {
    await sql.query(
      `INSERT INTO transactions (date, direction, amount, counterparty, description, transaction_reference, fees, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [date, direction, amount, counterparty, description ?? null, transaction_reference ?? null, fees ?? 0, notes ?? null]
    );
    return {};
  } catch (e) {
    return { error: String(e) };
  }
}

export async function updateTransaction(id: string, formData: TransactionFormData): Promise<{ error?: string }> {
  const parsed = transactionSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { date, direction, amount, counterparty, description, transaction_reference, fees, notes } = parsed.data;
  try {
    await sql.query(
      `UPDATE transactions SET date=$1, direction=$2, amount=$3, counterparty=$4,
       description=$5, transaction_reference=$6, fees=$7, notes=$8 WHERE id=$9`,
      [date, direction, amount, counterparty, description ?? null, transaction_reference ?? null, fees ?? 0, notes ?? null, id]
    );
    return {};
  } catch (e) {
    return { error: String(e) };
  }
}

export async function deleteTransaction(id: string): Promise<{ error?: string }> {
  try {
    await sql.query(`DELETE FROM transactions WHERE id=$1`, [id]);
    return {};
  } catch (e) {
    return { error: String(e) };
  }
}
