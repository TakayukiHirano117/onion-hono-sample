import { ValidationError } from "../../shared/exception/domain_error";
import { BaseValueObject } from "../../shared/vo/base_value_object";
import type { TopImageExtension } from "./top_image_metadata";

const UUID_PATTERN = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const TOP_IMAGE_PATH_PATTERN = new RegExp(
  `^photos/${UUID_PATTERN}/(?:top|${UUID_PATTERN})\\.(jpg|jpeg|png|webp)$`,
);

export class TopImagePath extends BaseValueObject<string> {
  protected validate(value: string): void {
    if (!TOP_IMAGE_PATH_PATTERN.test(value)) {
      throw new ValidationError("トップ画像パスの形式が不正です。");
    }
  }

  static forMember(memberId: string, extension: "jpg" | "jpeg" | "png" | "webp"): TopImagePath {
    return new TopImagePath(`photos/${memberId}/top.${extension}`);
  }

  static forUpload(
    memberId: string,
    uploadId: string,
    extension: TopImageExtension,
  ): TopImagePath {
    return new TopImagePath(`photos/${memberId}/${uploadId}.${extension}`);
  }
}
