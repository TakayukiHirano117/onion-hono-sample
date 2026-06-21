import { Context } from "hono";
import { getCookie, deleteCookie } from "hono/cookie";
import { LogoutAppService } from "../../../ApplicationService/Auth/members/logout_app_service";

export class LogoutController {
  constructor(private readonly _logoutAppService: LogoutAppService) {}

  async handle(c: Context) {
    const sessionId = getCookie(c, "session_id");
    if (!sessionId) {
      return c.json({ error: "セッションが存在しません。" }, 401);
    }

    await this._logoutAppService.execute(sessionId);

    deleteCookie(c, "session_id", {
      path: "/",
    });

    return c.json({ status: "ok" }, 200);
  }
}