import { getCookie } from "hono/cookie";
import type { MiddlewareHandler } from "hono";
import type { Kysely } from "kysely";
import { UnauthorizedError } from "../../../application_service/shared/exception/application_error";
import type { Database } from "../../../infra/database/types";
import type { AppEnv } from "../../types/app_env";

export class AuthMiddleware {
  constructor(private readonly _db: Kysely<Database>) {}

  handle: MiddlewareHandler<AppEnv> = async (c, next) => {
    const sessionId = getCookie(c, "session_id");
    if (!sessionId) {
      throw new UnauthorizedError("認証が必要です。");
    }

    const session = await this._db
      .selectFrom("sessions")
      .select(["id", "member_id"])
      .where("id", "=", sessionId)
      .where("expires_at", ">", new Date())
      .executeTakeFirst();

    if (!session) {
      throw new UnauthorizedError("認証が必要です。");
    }

    c.set("memberId", session.member_id);

    await next();
  };
}
