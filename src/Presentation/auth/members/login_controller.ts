import { z } from "zod";
import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { LoginAppService } from "../../../ApplicationService/Auth/members/login_app_service";

const loginRequestSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export class LoginController {
  constructor(
    private readonly _loginAppService: LoginAppService
  ) { }

  async handle(c: Context) {
    const requestBody = await c.req.json();
    const parseResult = loginRequestSchema.safeParse(requestBody);

    if (!parseResult.success) {
      return c.json({ errors: parseResult.error.issues }, 422);
    }

    const { sessionId, expiresAt, member } = await this._loginAppService.execute(parseResult.data);

    setCookie(c, "session_id", sessionId, {
      httpOnly: true, // javascriptからcookieにアクセスできないようにする
      secure: true, // httpsでしかcookieを送信できないようにする
      sameSite: "Lax", // 同じサイトからのリクエストのみcookieを送信できるようにする
      expires: expiresAt, // 有効期限
      path: "/", // 全てのパスでcookieを送信できるようにする
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