import { describe, expect, it } from "vitest";
import { ValidationError } from "../../shared/exception/domain_error";
import { UUID } from "../../shared/vo/uuid";
import { TopImagePath } from "./top_image_path";

const memberId = new UUID("00000000-0000-4000-8000-000000000001");

describe("TopImagePath", () => {
  it("会員 ID と拡張子からパスを生成する", () => {
    const path = TopImagePath.forMember(memberId, "webp");

    expect(path.value).toBe("members/00000000-0000-4000-8000-000000000001/top.webp");
    expect(path.memberId().value).toBe(memberId.value);
  });

  it("不正な拡張子は拒否する", () => {
    expect(() => TopImagePath.forMember(memberId, "gif")).toThrow(ValidationError);
  });

  it("不正なパス形式は拒否する", () => {
    expect(() => new TopImagePath("invalid/path.jpg")).toThrow(ValidationError);
  });
});
