import type { Context } from "hono";
import * as z from "zod";
import type { CompleteTopImageUploadAppService } from "../../application_service/member/complete_top_image_upload_app_service";
import type { AppEnv } from "../../cmd/types/app_env";
import { parseJsonBody } from "../shared/parse_json_body";
import { parseRequest } from "../shared/parse_request";

const requestSchema = z.object({
  uploadId: z.string(),
  contentType: z.string(),
});

export class CompleteTopImageUploadController {
  constructor(
    private readonly _completeTopImageUploadAppService: Pick<
      CompleteTopImageUploadAppService,
      "execute"
    >,
  ) {}

  async handle(c: Context<AppEnv>) {
    const requestBody = await parseJsonBody(c.req.raw);
    const input = parseRequest(requestSchema, requestBody);
    const result = await this._completeTopImageUploadAppService.execute({
      viewerMemberId: c.get("memberId"),
      uploadId: input.uploadId,
      contentType: input.contentType,
    });

    return c.json({ status: "ok", ...result }, 200);
  }
}
