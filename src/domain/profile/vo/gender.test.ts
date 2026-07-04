import { describe, it, expect } from "vitest";
import { ValidationError } from "../../shared/exception/domain_error";
import { Gender } from "./gender";

describe("Genger", () => {
  it("正しい性別でインスタンス化できる", () => {
    const gender = new Gender("male");
    expect(gender).toBeInstanceOf(Gender);
  });

  it("不正な性別でエラーが発生する", () => {
    expect(() => new Gender("invalid")).toThrow(ValidationError);
  });

  it("male の閲覧対象は female のみ", () => {
    const gender = new Gender("male");
    expect(gender.discoveryTargetGenders()).toEqual(["female"]);
  });

  it("female の閲覧対象は male のみ", () => {
    const gender = new Gender("female");
    expect(gender.discoveryTargetGenders()).toEqual(["male"]);
  });

  it("other の閲覧対象は性別フィルタなし", () => {
    const gender = new Gender("other");
    expect(gender.discoveryTargetGenders()).toBeNull();
  });
});
