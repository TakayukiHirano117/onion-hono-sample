import type { Transaction } from "kysely";
import type { Database } from "../database/types";

export interface ITransactionManager {
  runInTransaction<T>(
    callback: (tx: Transaction<Database>) => Promise<T>
  ): Promise<T>;
}
