import { ISessionDeleteManager } from "./i_session_delete_manager";
import type { Kysely } from "kysely";
import type { Database } from "../Database/types";
import { db } from "../Database/database";

export class SessionDeleteManager implements ISessionDeleteManager {
  constructor(private readonly _db: Kysely<Database> = db) {}

  async execute(sessionId: string): Promise<void> {
    await this._db.deleteFrom("sessions").where("id", "=", sessionId).execute();
  }
}