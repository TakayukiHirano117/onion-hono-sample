import type { Kysely, Transaction } from "kysely";
import type { Database } from "./types";

export type DbExecutor = Kysely<Database> | Transaction<Database>;

export function resolveExecutor(
  db: Kysely<Database>,
  tx?: unknown,
): DbExecutor {
  if (tx !== undefined) {
    return tx as DbExecutor;
  }

  return db;
}
