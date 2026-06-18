import type { Kysely } from "kysely";
import type { Database } from "../Database/types";
export interface ITransactionManager {
  runInTransaction<T>(
    callback: (tx: Kysely<Database>) => Promise<T>
  ): Promise<T>;
}