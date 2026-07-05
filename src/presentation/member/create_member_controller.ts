import { Context } from "hono";
import { z } from "zod";
import { CreateMemberAppService } from "../../application_service/member/create_member_app_service";
import { TopImageUpload } from "../../domain/profile/vo/top_image_upload";
import { BadRequestError } from "../../application_service/shared/exception/application_error";
import { parseRequest } from "../shared/parse_request";

const createMemberFieldsSchema = z.object({
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
      const body = await c.req.parseBody();
      const fields = parseRequest(createMemberFieldsSchema, {
        name: body.name,
        email: body.email,
        rawPassword: body.rawPassword,
        bio: body.bio,
        gender: body.gender,
        birthDate: body.birthDate,
      });

      const topImageField = body.topImage;
      let topImage: TopImageUpload | null = null;

      if (topImageField instanceof File && topImageField.size > 0) {
        const bytes = new Uint8Array(await topImageField.arrayBuffer());
        topImage = new TopImageUpload(bytes, topImageField.type);
      }

      await this._createMemberAppService.execute({
        ...fields,
        topImage,
      });

      return c.json({ status: "ok" }, 200);
    }

    if (contentType.includes("application/json")) {
      const requestBody = await c.req.json();
      const input = parseRequest(createMemberFieldsSchema, requestBody);
      await this._createMemberAppService.execute(input);
      return c.json({ status: "ok" }, 200);
    }

    throw new BadRequestError("Content-Type が不正です。");
  }
}
