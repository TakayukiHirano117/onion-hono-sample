import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Database } from "./types";

export function createDb(connectionString: string): Kysely<Database> {
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString,
    }),
  });

  return new Kysely<Database>({
    dialect,
  });
}

export function createDbFromDatabaseUrl(): Kysely<Database> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return createDb(connectionString);
}
