import { Context } from "hono";
import { UploadTopImageAppService } from "../../application_service/member/upload_top_image_app_service";
import { BadRequestError } from "../../application_service/shared/exception/application_error";
import type { AppEnv } from "../../cmd/types/app_env";

export class UploadTopImageController {
  constructor(private readonly _uploadTopImageAppService: UploadTopImageAppService) {}

  async handle(c: Context<AppEnv>) {
    const body = await c.req.parseBody();
    const file = body.topImage;

    if (!(file instanceof File)) {
      throw new BadRequestError("トップ画像ファイルが必要です。");
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = await this._uploadTopImageAppService.execute({
      memberId: c.get("memberId"),
      bytes,
      contentType: file.type,
    });

    return c.json({ status: "ok", topImageUrl: result.topImageUrl });
  }
}
