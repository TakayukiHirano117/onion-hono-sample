import { ISessionDeleteManager } from "./i_session_delete_manager";
import type { Kysely } from "kysely";
import type { Database } from "../Database/types";

export class SessionDeleteManager implements ISessionDeleteManager {
  constructor(private readonly _db: Kysely<Database>) {}

  async execute(sessionId: string): Promise<void> {
    await this._db.deleteFrom("sessions").where("id", "=", sessionId).execute();
  }
}