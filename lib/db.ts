import { neon } from "@neondatabase/serverless";

const rawUrl = process.env.DATABASE_URL ?? "";
const cleanUrl = rawUrl
  .replace("channel_binding=require&", "")
  .replace("&channel_binding=require", "")
  .replace("?channel_binding=require", "");

export const sql = neon(cleanUrl);
