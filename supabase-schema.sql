-- ShopLedger: Run this entire script in the Supabase SQL Editor

-- Create the transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date                  DATE NOT NULL,
  direction             TEXT NOT NULL CHECK (direction IN ('received', 'sent')),
  amount                NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  counterparty          TEXT NOT NULL,
  description           TEXT,
  transaction_reference TEXT,
  fees                  NUMERIC(15, 2) DEFAULT 0 CHECK (fees >= 0),
  notes                 TEXT
);

-- Index for sorting and date filtering
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_direction ON transactions (direction);
CREATE INDEX IF NOT EXISTS idx_transactions_counterparty ON transactions (counterparty);

-- Disable RLS (no auth required for personal use)
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
