import { ValidationError } from "../../shared/exception/domain_error";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number];

export class TopImageUpload {
  static readonly MAX_BYTES = 5 * 1024 * 1024;

  private readonly _bytes: Uint8Array;
  private readonly _contentType: AllowedContentType;

  constructor(bytes: Uint8Array, contentType: string) {
    this.validateSize(bytes);
    this._contentType = this.validateContentType(contentType);
    this._bytes = bytes;
  }

  get bytes(): Uint8Array {
    return this._bytes;
  }

  get contentType(): AllowedContentType {
    return this._contentType;
  }

  extension(): string {
    switch (this._contentType) {
      case "image/jpeg":
        return "jpg";
      case "image/png":
        return "png";
      case "image/webp":
        return "webp";
    }
  }

  private validateSize(bytes: Uint8Array): void {
    if (bytes.byteLength === 0) {
      throw new ValidationError("トップ画像が空です。");
    }

    if (bytes.byteLength > TopImageUpload.MAX_BYTES) {
      throw new ValidationError("トップ画像のサイズが上限を超えています。");
    }
  }

  private validateContentType(contentType: string): AllowedContentType {
    if (!ALLOWED_CONTENT_TYPES.includes(contentType as AllowedContentType)) {
      throw new ValidationError("トップ画像の形式が不正です。");
    }

    return contentType as AllowedContentType;
  }
}
