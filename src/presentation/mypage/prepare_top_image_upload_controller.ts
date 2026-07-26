import type { Context } from "hono";
import * as z from "zod";
import type { PrepareTopImageUploadAppService } from "../../application_service/member/prepare_top_image_upload_app_service";
import type { AppEnv } from "../../cmd/types/app_env";
import { parseJsonBody } from "../shared/parse_json_body";
import { parseRequest } from "../shared/parse_request";

const requestSchema = z.object({
  contentType: z.string(),
});

export class PrepareTopImageUploadController {
  constructor(
    private readonly _prepareTopImageUploadAppService: Pick<
      PrepareTopImageUploadAppService,
      "execute"
    >,
  ) {}

  async handle(c: Context<AppEnv>) {
    const requestBody = await parseJsonBody(c.req.raw);
    const input = parseRequest(requestSchema, requestBody);
    const result = await this._prepareTopImageUploadAppService.execute({
      viewerMemberId: c.get("memberId"),
      contentType: input.contentType,
    });

    return c.json({ status: "ok", ...result }, 200);
  }
}
