import { TopImageMetadata } from "../../domain/profile/vo/top_image_metadata";
import { UUID } from "../../domain/shared/vo/uuid";
import type { IImageUploader } from "../../infra/shared/i_image_uploader";

type RequestDto = {
  viewerMemberId: string;
  contentType: string;
};

type ResponseDto = {
  url: string;
  fields: Record<string, string>;
  uploadId: string;
};

type IdGenerator = {
  execute(): string;
};

export class PrepareTopImageUploadAppService {
  constructor(
    private readonly _imageUploader: IImageUploader,
    private readonly _idGenerator: IdGenerator,
    private readonly _expiresInSeconds = 300,
  ) {}

  async execute(input: RequestDto): Promise<ResponseDto> {
    const memberId = new UUID(input.viewerMemberId);
    const metadata = new TopImageMetadata(input.contentType);
    const uploadId = new UUID(this._idGenerator.execute());
    const key = `pending/${memberId.value}/${uploadId.value}.${metadata.extension()}`;
    const preparedUpload = await this._imageUploader.prepare({
      key,
      contentType: metadata.contentType,
      maxBytes: TopImageMetadata.MAX_BYTES,
      expiresInSeconds: this._expiresInSeconds,
    });

    return {
      ...preparedUpload,
      uploadId: uploadId.value,
    };
  }
}
