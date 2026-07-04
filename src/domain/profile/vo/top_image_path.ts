import { ValidationError } from "../../shared/exception/domain_error";
import { UUID } from "../../shared/vo/uuid";

const PATH_PATTERN =
  /^members\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/top\.(jpg|jpeg|png|webp)$/;

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

export class TopImagePath {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  static forMember(memberId: UUID, extension: string): TopImagePath {
    const normalizedExtension = extension.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(normalizedExtension as AllowedExtension)) {
      throw new ValidationError("トップ画像の拡張子が不正です。");
    }

    return new TopImagePath(`members/${memberId.value}/top.${normalizedExtension}`);
  }

  private validate(value: string): void {
    if (!PATH_PATTERN.test(value)) {
      throw new ValidationError("トップ画像パスの形式が不正です。");
    }
  }

  get value(): string {
    return this._value;
  }

  memberId(): UUID {
    const match = /^members\/([0-9a-f-]{36})\//.exec(this._value);
    if (!match) {
      throw new ValidationError("トップ画像パスの形式が不正です。");
    }

    return new UUID(match[1]);
  }
}
