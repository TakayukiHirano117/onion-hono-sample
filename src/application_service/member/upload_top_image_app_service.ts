import { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { TopImagePath } from "../../domain/profile/vo/top_image_path";
import type { TopImageUpload } from "../../domain/profile/vo/top_image_upload";
import { UUID } from "../../domain/shared/vo/uuid";
import { NotFoundError } from "../shared/exception/application_error";
import type { IObjectStorage } from "../shared/i_object_storage";
import type { ITopImageUrlResolver } from "../shared/i_top_image_url_resolver";

type RequestDto = {
  viewerMemberId: string;
  topImage: TopImageUpload;
};

type ResponseDto = {
  topImageUrl: string;
};

export class UploadTopImageAppService {
  constructor(
    private readonly _profileRepository: IProfileRepository,
    private readonly _objectStorage: IObjectStorage,
    private readonly _topImageUrlResolver: ITopImageUrlResolver,
  ) {}

  async execute(input: RequestDto): Promise<ResponseDto> {
    const memberId = new UUID(input.viewerMemberId);

    const profile = await this._profileRepository.findByMemberId(memberId);
    if (!profile) {
      throw new NotFoundError("プロフィールが存在しません。");
    }

    const previousPath = profile.topImagePath;
    const nextPath = TopImagePath.forMember(memberId.value, input.topImage.extension());

    await this._objectStorage.put(
      nextPath.value,
      input.topImage.bytes,
      input.topImage.contentType,
    );

    try {
      await this._profileRepository.updateTopImagePath(memberId, nextPath);
    } catch (error) {
      await this._objectStorage.delete(nextPath.value);
      throw error;
    }

    if (previousPath && previousPath.value !== nextPath.value) {
      await this._objectStorage.delete(previousPath.value);
    }

    const topImageUrl = this._topImageUrlResolver.resolve(nextPath);
    if (!topImageUrl) {
      throw new Error("MEDIA_PUBLIC_BASE_URL is not configured");
    }

    return { topImageUrl };
  }
}
