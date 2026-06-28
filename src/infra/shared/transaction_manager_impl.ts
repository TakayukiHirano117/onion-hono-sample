import type { Kysely, Transaction } from "kysely";
import type { Database } from "../database/types";
import type { ITransactionManager } from "./i_transaction_manager";

export class TransactionManagerImpl implements ITransactionManager {
  constructor(private readonly _db: Kysely<Database>) {}

  async runInTransaction<T>(
    callback: (tx: Transaction<Database>) => Promise<T>,
  ): Promise<T> {
    return this._db.transaction().execute(callback);
  }
}
