import { describe, expect, it } from "vitest";
import { ValidationError } from "../../shared/exception/domain_error";
import { TopImageMetadata } from "./top_image_metadata";

describe("TopImageMetadata", () => {
  it.each([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
  ] as const)("許可MIME %s を拡張子 %s に変換する", (contentType, extension) => {
    expect(new TopImageMetadata(contentType, 1).extension()).toBe(extension);
  });

  it("許可されていないMIMEを拒否する", () => {
    expect(() => new TopImageMetadata("image/gif", 1)).toThrow(ValidationError);
  });

  it("5MBを超える画像を拒否する", () => {
    expect(() => new TopImageMetadata("image/jpeg", TopImageMetadata.MAX_BYTES + 1)).toThrow(
      ValidationError,
    );
  });

  it("空画像を拒否する", () => {
    expect(() => new TopImageMetadata("image/jpeg", 0)).toThrow(ValidationError);
  });
});
