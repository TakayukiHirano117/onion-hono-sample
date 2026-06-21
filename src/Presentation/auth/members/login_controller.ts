import { z } from "zod";
import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { LoginMemberAppService } from "../../../ApplicationService/Member/login_member_app_service";

const loginMemberRequestSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export class LoginController {
  constructor(
    private readonly _loginMemberAppService: LoginMemberAppService
  ) { }

  async handle(c: Context) {
    const requestBody = await c.req.json();
    const parseResult = loginMemberRequestSchema.safeParse(requestBody);

    if (!parseResult.success) {
      return c.json({ errors: parseResult.error.issues }, 422);
    }

    const { sessionId, expiresAt, member } = await this._loginMemberAppService.execute(parseResult.data);

    setCookie(c, "session_id", sessionId, {
      httpOnly: true,
      secure: true,
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