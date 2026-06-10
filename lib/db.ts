import { neon } from "@neondatabase/serverless";

// Strip channel_binding param — not supported by the HTTP driver
const rawUrl = process.env.DATABASE_URL ?? "";
const cleanUrl = rawUrl
  .replace("channel_binding=require&", "")
  .replace("&channel_binding=require", "")
  .replace("?channel_binding=require", "");

const _sql = neon(cleanUrl);

// Tagged template for static queries: sql`SELECT ...`
export const sql = _sql;

// Regular function for dynamic parameterized queries: query("SELECT ... $1", [val])
export async function query(text: string, params: unknown[] = []): Promise<Record<string, unknown>[]> {
  return (_sql as unknown as (t: string, p: unknown[]) => Promise<Record<string, unknown>[]>)(text, params);
}
