import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Reuse one client across dev hot reloads so connections don't pile up.
const globalForDb = globalThis as unknown as { pgClient?: postgres.Sql };

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = globalForDb.pgClient ?? postgres(connectionString, { prepare: false });
if (process.env.NODE_ENV !== "production") globalForDb.pgClient = client;

export const db = drizzle(client);
