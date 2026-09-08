import { neon, neonConfig } from "@neondatabase/serverless";

// Enable connection caching across serverless invocations
neonConfig.fetchConnectionCache = true;

/**
 * Neon Serverless Database Client
 * Uses connection pooling via WebSocket/HTTP fetch to prevent connection exhaustion
 * on Vercel Edge & Serverless Functions.
 */
export function getNeonClient() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_URL;

  if (!connectionString) {
    return null;
  }

  try {
    return neon(connectionString);
  } catch (error) {
    console.error("[Neon DB] Connection initialization error:", error);
    return null;
  }
}

/**
 * Execute raw SQL query with parameters against Neon Postgres
 */
export async function executeNeonQuery<T = any>(
  queryText: string,
  params: any[] = []
): Promise<T[]> {
  const sql = getNeonClient();
  if (!sql) {
    return [];
  }

  try {
    const result = await (sql as any)(queryText, params);
    return result as T[];
  } catch (error) {
    console.error("[Neon DB] Query execution error:", error);
    throw error;
  }
}

/**
 * Check if the Neon database connection is active and responsive
 */
export async function checkNeonHealth(): Promise<{
  connected: boolean;
  version?: string;
  now?: string;
  error?: string;
}> {
  const sql = getNeonClient();
  if (!sql) {
    return { connected: false, error: "Missing database connection string" };
  }

  try {
    const res = await sql`SELECT NOW() as now, version() as version;`;
    if (res && res.length > 0) {
      return {
        connected: true,
        version: res[0].version,
        now: res[0].now,
      };
    }
    return { connected: false, error: "Empty result from query" };
  } catch (err: any) {
    return { connected: false, error: err.message || "Failed to query Neon" };
  }
}
