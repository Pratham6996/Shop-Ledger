export type Direction = "received" | "sent";

export interface Transaction {
  id: string;
  created_at: string;
  date: string;
  direction: Direction;
  amount: number;
  counterparty: string;
  description?: string | null;
  transaction_reference?: string | null;
  fees?: number | null;
  notes?: string | null;
}

export interface TransactionFilters {
  search?: string;
  direction?: Direction | "all";
  dateFrom?: string;
  dateTo?: string;
}

export interface MonthlySummary {
  month: string;
  year: number;
  totalReceived: number;
  totalSent: number;
  netBalance: number;
  count: number;
}

export interface DashboardStats {
  totalReceived: number;
  totalSent: number;
  netBalance: number;
  transactionCount: number;
}
