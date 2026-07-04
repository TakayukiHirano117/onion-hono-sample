import { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { TopImagePath } from "../../domain/profile/vo/top_image_path";
import { TopImageUpload } from "../../domain/profile/vo/top_image_upload";
import { UUID } from "../../domain/shared/vo/uuid";
import { NotFoundError } from "../shared/exception/application_error";
import type { IObjectStorage } from "../shared/i_object_storage";
import type { ITopImageUrlResolver } from "../shared/i_top_image_url_resolver";

type UploadTopImageInput = {
  memberId: string;
  bytes: Uint8Array;
  contentType: string;
};

export class UploadTopImageAppService {
  constructor(
    private readonly _profileRepository: IProfileRepository,
    private readonly _objectStorage: IObjectStorage,
    private readonly _topImageUrlResolver: ITopImageUrlResolver,
  ) {}

  async execute(input: UploadTopImageInput): Promise<{ topImageUrl: string }> {
    const memberId = new UUID(input.memberId);

    const profile = await this._profileRepository.findByMemberId(memberId);
    if (!profile) {
      throw new NotFoundError("プロフィールが存在しません。");
    }

    const upload = new TopImageUpload(input.bytes, input.contentType);
    const path = TopImagePath.forMember(memberId, upload.extension());

    await this._objectStorage.put(path.value, upload.bytes, upload.contentType);
    await this._profileRepository.updateTopImagePath(memberId, path);

    const topImageUrl = this._topImageUrlResolver.resolve(path.value);
    if (topImageUrl === null) {
      throw new NotFoundError("トップ画像 URL を生成できません。");
    }

    return { topImageUrl };
  }
}
