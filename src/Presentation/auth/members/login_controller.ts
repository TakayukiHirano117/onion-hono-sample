import { z } from "zod";
import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { LoginAppService } from "../../../ApplicationService/Auth/members/login_app_service";
import { parseRequest } from "../../shared/parse_request";

const loginRequestSchema = z.object({
  email: z.string(),
  password: z.string(),
});

type LoginCookieConfig = {
  secure: boolean;
};

export class LoginController {
  constructor(
    private readonly _loginAppService: LoginAppService,
    private readonly _loginCookieConfig: LoginCookieConfig,
  ) {}

  async handle(c: Context) {
    const requestBody = await c.req.json();
    const input = parseRequest(loginRequestSchema, requestBody);

    const { sessionId, expiresAt, member } = await this._loginAppService.execute(input);

    setCookie(c, "session_id", sessionId, {
      httpOnly: true,
      secure: this._loginCookieConfig.secure,
      sameSite: "Lax",
      expires: expiresAt,
      path: "/",
    });

    return c.json(
      {
        status: "ok",
        member: {
          id: member.id.value,
          name: member.name.value,
          email: member.email.value,
        },
      },
      200,
    );
  }
}
