import { Context } from "hono";
import { UploadTopImageAppService } from "../../application_service/member/upload_top_image_app_service";
import { TopImageUpload } from "../../domain/profile/vo/top_image_upload";
import { BadRequestError } from "../../application_service/shared/exception/application_error";

export class UploadTopImageController {
  constructor(private readonly _uploadTopImageAppService: UploadTopImageAppService) {}

  async handle(c: Context) {
    const body = await c.req.parseBody();
    const topImageField = body.topImage;

    if (!(topImageField instanceof File) || topImageField.size === 0) {
      throw new BadRequestError("画像ファイルが必要です。");
    }

    const bytes = new Uint8Array(await topImageField.arrayBuffer());
    const topImage = new TopImageUpload(bytes, topImageField.type);
    const viewerMemberId = c.get("memberId");

    const result = await this._uploadTopImageAppService.execute({
      viewerMemberId,
      topImage,
    });

    return c.json({ status: "ok", topImageUrl: result.topImageUrl }, 200);
  }
}
