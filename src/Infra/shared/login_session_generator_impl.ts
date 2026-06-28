import { ILoginSessionGenerator } from "./i_login_session_generator";
import type { Kysely } from "kysely";
import type { Database } from "../Database/types";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export class LoginSessionGeneratorImpl implements ILoginSessionGenerator {
  constructor(private readonly _db: Kysely<Database>) {}

  async execute(
    uuid: string,
    memberId: string,
  ): Promise<{ id: string; member_id: string; expires_at: Date }> {
    const session = {
      id: uuid,
      member_id: memberId,
      expires_at: new Date(Date.now() + SESSION_TTL_MS),
    };

    await this._db.insertInto("sessions").values(session).execute();

    return {
      id: session.id,
      member_id: session.member_id,
      expires_at: session.expires_at,
    };
  }
}