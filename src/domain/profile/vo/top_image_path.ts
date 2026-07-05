import { ValidationError } from "../../shared/exception/domain_error";
import { BaseValueObject } from "../../shared/vo/base_value_object";

const TOP_IMAGE_PATH_PATTERN = /^photos\/[0-9a-f-]+\/top\.(jpg|jpeg|png|webp)$/;

export class TopImagePath extends BaseValueObject<string> {
  protected validate(value: string): void {
    if (!TOP_IMAGE_PATH_PATTERN.test(value)) {
      throw new ValidationError("トップ画像パスの形式が不正です。");
    }
  }

  static forMember(memberId: string, extension: "jpg" | "jpeg" | "png" | "webp"): TopImagePath {
    return new TopImagePath(`photos/${memberId}/top.${extension}`);
  }
}
