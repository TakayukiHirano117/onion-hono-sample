import { describe, expect, it } from "vitest";
import { ValidationError } from "../../shared/exception/domain_error";
import { TopImageUpload } from "./top_image_upload";

describe("TopImageUpload", () => {
  it("許可された JPEG を受け付ける", () => {
    const upload = new TopImageUpload(new Uint8Array([1, 2, 3]), "image/jpeg");

    expect(upload.contentType).toBe("image/jpeg");
    expect(upload.extension()).toBe("jpg");
  });

  it("空ファイルは拒否する", () => {
    expect(() => new TopImageUpload(new Uint8Array(), "image/png")).toThrow(ValidationError);
  });

  it("サイズ上限を超えるファイルは拒否する", () => {
    const bytes = new Uint8Array(TopImageUpload.MAX_BYTES + 1);

    expect(() => new TopImageUpload(bytes, "image/png")).toThrow(ValidationError);
  });

  it("許可されていない MIME は拒否する", () => {
    expect(() => new TopImageUpload(new Uint8Array([1]), "image/gif")).toThrow(ValidationError);
  });
});
