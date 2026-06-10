import { neon } from "@neondatabase/serverless";

const _sql = neon(process.env.DATABASE_URL!);

// Tagged template for static queries: sql`SELECT ...`
export const sql = _sql;

// Regular function for dynamic parameterized queries: query("SELECT ... $1", [val])
export async function query(text: string, params: unknown[] = []): Promise<Record<string, unknown>[]> {
  return (_sql as unknown as (t: string, p: unknown[]) => Promise<Record<string, unknown>[]>)(text, params);
}
