import type { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { TopImageMetadata } from "../../domain/profile/vo/top_image_metadata";
import { TopImagePath } from "../../domain/profile/vo/top_image_path";
import { UUID } from "../../domain/shared/vo/uuid";
import type { IImageUploader, ImageMetadata } from "../../infra/shared/i_image_uploader";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../shared/exception/application_error";
import type { ITopImageUrlResolver } from "../shared/i_top_image_url_resolver";

type RequestDto = {
  viewerMemberId: string;
  uploadId: string;
  contentType: string;
};

type ResponseDto = {
  topImageUrl: string;
};

export class CompleteTopImageUploadAppService {
  constructor(
    private readonly _profileRepository: IProfileRepository,
    private readonly _imageUploader: IImageUploader,
    private readonly _topImageUrlResolver: ITopImageUrlResolver,
  ) {}

  async execute(input: RequestDto): Promise<ResponseDto> {
    const memberId = new UUID(input.viewerMemberId);
    const uploadId = new UUID(input.uploadId);
    const requestedMetadata = new TopImageMetadata(input.contentType);
    const extension = requestedMetadata.extension();
    const pendingKey = `pending/${memberId.value}/${uploadId.value}.${extension}`;
    const permanentPath = TopImagePath.forUpload(memberId.value, uploadId.value, extension);
    const topImageUrl = this._topImageUrlResolver.resolve(permanentPath);
    if (!topImageUrl) {
      throw new Error("トップ画像の公開URLを解決できません。");
    }

    const profile = await this._profileRepository.findByMemberId(memberId);
    if (!profile) {
      throw new NotFoundError("プロフィールが存在しません。");
    }

    if (profile.topImagePath?.value === permanentPath.value) {
      const permanentMetadata = await this._imageUploader.head(permanentPath.value);
      if (permanentMetadata) {
        this.validateStoredImage(permanentMetadata, requestedMetadata);
        return { topImageUrl };
      }
    }

    const storedMetadata = await this._imageUploader.head(pendingKey);
    if (!storedMetadata) {
      throw new NotFoundError("アップロード済み画像が存在しません。");
    }
    this.validateStoredImage(storedMetadata, requestedMetadata);

    try {
      await this._imageUploader.copy(pendingKey, permanentPath.value);
    } catch (error) {
      if (await this.isCompleted(memberId, permanentPath, requestedMetadata)) {
        return { topImageUrl };
      }
      throw error;
    }

    let updated: boolean;
    try {
      updated = await this._profileRepository.updateTopImagePathIfCurrent(
        memberId,
        profile.topImagePath,
        permanentPath,
      );
    } catch (error) {
      if (await this.isCompleted(memberId, permanentPath, requestedMetadata)) {
        return { topImageUrl };
      }
      throw error;
    }

    if (!updated) {
      if (await this.isCompleted(memberId, permanentPath, requestedMetadata)) {
        return { topImageUrl };
      }

      // CAS敗者は同一uploadIdの別実行が作ったfinalを識別できない。
      // 所有権を証明できないobjectは削除せず、S3 lifecycle cleanupへ委ねる。
      throw new ConflictError("トップ画像が同時に更新されました。");
    }

    await this._imageUploader.deleteBestEffort(pendingKey);
    const previousPath = profile.topImagePath;
    if (previousPath && previousPath.value !== permanentPath.value) {
      await this._imageUploader.deleteBestEffort(previousPath.value);
    }

    return { topImageUrl };
  }

  private async isCompleted(
    memberId: UUID,
    permanentPath: TopImagePath,
    requestedMetadata: TopImageMetadata,
  ): Promise<boolean> {
    const currentProfile = await this._profileRepository.findByMemberId(memberId);
    if (currentProfile?.topImagePath?.value !== permanentPath.value) {
      return false;
    }

    const permanentMetadata = await this._imageUploader.head(permanentPath.value);
    if (!permanentMetadata) {
      return false;
    }

    this.validateStoredImage(permanentMetadata, requestedMetadata);
    return true;
  }

  private validateStoredImage(
    storedMetadata: ImageMetadata,
    requestedMetadata: TopImageMetadata,
  ): void {
    if (
      storedMetadata.contentType !== requestedMetadata.contentType ||
      storedMetadata.contentLength === undefined
    ) {
      throw new BadRequestError("アップロード済み画像の形式が不正です。");
    }

    new TopImageMetadata(storedMetadata.contentType, storedMetadata.contentLength);
  }
}
