import { ValidationError } from "../../shared/exception/domain_error";

const EXTENSION_BY_CONTENT_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type TopImageExtension =
  (typeof EXTENSION_BY_CONTENT_TYPE)[keyof typeof EXTENSION_BY_CONTENT_TYPE];

export class TopImageMetadata {
  static readonly MAX_BYTES = 5 * 1024 * 1024;

  constructor(
    readonly contentType: string,
    readonly contentLength?: number,
  ) {
    this.validate();
  }

  extension(): TopImageExtension {
    if (this.isAllowedContentType(this.contentType)) {
      return EXTENSION_BY_CONTENT_TYPE[this.contentType];
    }

    throw new ValidationError("トップ画像の形式が不正です。");
  }

  private validate(): void {
    if (!this.isAllowedContentType(this.contentType)) {
      throw new ValidationError("トップ画像の形式が不正です。");
    }

    if (this.contentLength === undefined) {
      return;
    }

    if (this.contentLength === 0) {
      throw new ValidationError("トップ画像が空です。");
    }

    if (this.contentLength < 0 || this.contentLength > TopImageMetadata.MAX_BYTES) {
      throw new ValidationError("トップ画像のサイズが上限を超えています。");
    }
  }

  private isAllowedContentType(
    contentType: string,
  ): contentType is keyof typeof EXTENSION_BY_CONTENT_TYPE {
    return Object.hasOwn(EXTENSION_BY_CONTENT_TYPE, contentType);
  }
}
