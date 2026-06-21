import { getCookie } from "hono/cookie";
import type { MiddlewareHandler } from "hono";
import type { Kysely } from "kysely";
import { db } from "../../../Infra/Database/database";
import type { Database } from "../../../Infra/Database/types";

export class AuthMiddleware {
  constructor(private readonly _db: Kysely<Database> = db) {}

  handle: MiddlewareHandler = async (c, next) => {
    const sessionId = getCookie(c, "session_id");
    if (!sessionId) {
      return c.json({ error: "認証が必要です。" }, 401);
    }

    const session = await this._db
      .selectFrom("sessions")
      .select(["id"])
      .where("id", "=", sessionId)
      .where("expires_at", ">", new Date())
      .executeTakeFirst();

    if (!session) {
      return c.json({ error: "認証が必要です。" }, 401);
    }

    await next();
  };
}