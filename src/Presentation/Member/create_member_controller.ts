import { Context } from "hono";
import { z } from "zod";
import { CreateMemberAppService } from "../../ApplicationService/Member/create_member_app_service";
import { Name } from "../../Domain/Member/vo/name";

// これドメインロジックがプレゼンテーションに出てるのは微妙かも
const createMemberRequestSchema = z.object({
  name: z.string().min(Name.MIN_NAME_LENGTH).max(Name.MAX_NAME_LENGTH),
  email: z.string().email(),
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
