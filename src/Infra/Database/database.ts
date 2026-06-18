import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Database } from "./types";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
