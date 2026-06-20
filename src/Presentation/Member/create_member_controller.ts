import { Context } from "hono";
import { z } from "zod";
import { CreateMemberAppService } from "../../ApplicationService/Member/create_member_app_service";

const createMemberRequestSchema = z.object({
  name: z.string(),
  email: z.string(),
  bio: z.string(),
  gender: z.string(),
  birthDate: z.string(),
});

export class CreateMemberController {
  constructor(
    private readonly _createMemberAppService: CreateMemberAppService,
  ) {}

  async handle(c: Context) {
    const requestBody = await c.req.json();
    const parseResult = createMemberRequestSchema.safeParse(requestBody);

    if (!parseResult.success) {
      return c.json({ errors: parseResult.error.issues }, 422);
    }

    await this._createMemberAppService.execute(parseResult.data);

    return c.json({ status: "ok" }, 200);
  }
}
