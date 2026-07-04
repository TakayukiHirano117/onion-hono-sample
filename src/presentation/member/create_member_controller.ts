import { Context } from "hono";
import { z } from "zod";
import { CreateMemberAppService } from "../../application_service/member/create_member_app_service";
import { BadRequestError } from "../../application_service/shared/exception/application_error";
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
    const contentType = c.req.header("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      return this.handleMultipart(c);
    }

    return this.handleJson(c);
  }

  private async handleJson(c: Context) {
    const requestBody = await c.req.json();
    const input = parseRequest(createMemberRequestSchema, requestBody);

    await this._createMemberAppService.execute(input);

    return c.json({ status: "ok" }, 200);
  }

  private async handleMultipart(c: Context) {
    const body = await c.req.parseBody();
    const input = parseRequest(createMemberRequestSchema, {
      name: readTextField(body.name),
      email: readTextField(body.email),
      rawPassword: readTextField(body.rawPassword),
      bio: readTextField(body.bio),
      gender: readTextField(body.gender),
      birthDate: readTextField(body.birthDate),
    });

    const topImageFile = body.topImage;
    const topImage =
      topImageFile instanceof File && topImageFile.size > 0
        ? {
            bytes: new Uint8Array(await topImageFile.arrayBuffer()),
            contentType: topImageFile.type,
          }
        : null;

    await this._createMemberAppService.execute({
      ...input,
      topImage,
    });

    return c.json({ status: "ok" }, 200);
  }
}

function readTextField(value: FormDataEntryValue | undefined): string {
  if (typeof value !== "string") {
    throw new BadRequestError("入力形式が不正です。");
  }

  return value;
}
