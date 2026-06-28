import { Context } from "hono";
import { getCookie, deleteCookie } from "hono/cookie";
import { LogoutAppService } from "../../../application_service/auth/members/logout_app_service";
import { UnauthorizedError } from "../../../application_service/shared/exception/application_error";

export class LogoutController {
  constructor(private readonly _logoutAppService: LogoutAppService) {}

  async handle(c: Context) {
    const sessionId = getCookie(c, "session_id");
    if (!sessionId) {
      throw new UnauthorizedError("セッションが存在しません。");
    }

    await this._logoutAppService.execute(sessionId);

    deleteCookie(c, "session_id", {
      path: "/",
    });

    return c.json({ status: "ok" }, 200);
  }
}
