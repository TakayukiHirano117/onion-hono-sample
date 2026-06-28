import { Context } from "hono";
import { z } from "zod";
import { CreateMemberAppService } from "../../application_service/member/create_member_app_service";
import { parseRequest } from "../shared/parse_request";

const createMemberRequestSchema = z.object({
  name: z.string(),
  email: z.string(),
  rawPassword: z.string(),
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
    const input = parseRequest(createMemberRequestSchema, requestBody);

    await this._createMemberAppService.execute(input);

    return c.json({ status: "ok" }, 200);
  }
}
