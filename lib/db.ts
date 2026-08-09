import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Lazy Neon client, resolved at call time so a missing env var surfaces as a
// clean runtime error on a real request, not a build-time crash.
let _sql: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  if (!_sql) _sql = neon(url);
  return _sql;
}
