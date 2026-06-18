import type { Transaction } from "kysely";
import { db } from "../Database/database";
import type { Database } from "../Database/types";
import type { ITransactionManager } from "./i_transaction_manager";

export class TransactionManagerImpl implements ITransactionManager {
  async runInTransaction<T>(
    callback: (tx: Transaction<Database>) => Promise<T>
  ): Promise<T> {
    return db.transaction().execute(callback);
  }
}
