import { ValidationError } from "../../shared/exception/domain_error";

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_BYTES = 5 * 1024 * 1024;

export class TopImageUpload {
  constructor(
    readonly bytes: Uint8Array,
    readonly contentType: string,
  ) {
    this.validate();
  }

  extension(): "jpg" | "jpeg" | "png" | "webp" {
    switch (this.contentType) {
      case "image/jpeg":
        return "jpg";
      case "image/png":
        return "png";
      case "image/webp":
        return "webp";
      default:
        throw new ValidationError("トップ画像の形式が不正です。");
    }
  }

  private validate(): void {
    if (!ALLOWED_CONTENT_TYPES.has(this.contentType)) {
      throw new ValidationError("トップ画像の形式が不正です。");
    }

    if (this.bytes.byteLength === 0) {
      throw new ValidationError("トップ画像が空です。");
    }

    if (this.bytes.byteLength > MAX_BYTES) {
      throw new ValidationError("トップ画像のサイズが上限を超えています。");
    }
  }
}
