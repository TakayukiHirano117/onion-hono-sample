import { describe, expect, it } from "vitest";
import { TopImagePath } from "../../domain/profile/vo/top_image_path";
import type { ITopImageUrlResolver } from "../../application_service/shared/i_top_image_url_resolver";
import { TopImageUrlResolverImpl } from "./top_image_url_resolver_impl";

const path = new TopImagePath(
  "photos/00000000-0000-4000-8000-000000000001/00000000-0000-4000-8000-000000000002.jpg",
);

describe("TopImageUrlResolverImpl", () => {
  it("DBの画像pathをCloudFront URLへ解決できる", () => {
    const resolver: ITopImageUrlResolver = new TopImageUrlResolverImpl(
      "https://images.example.cloudfront.net",
    );

    expect(resolver.resolve(path)).toBe(`https://images.example.cloudfront.net/${path.value}`);
  });

  it("DBの画像pathをCloudflare R2 proxy URLへ解決できる", () => {
    const resolver: ITopImageUrlResolver = new TopImageUrlResolverImpl(
      "https://front.example.com/api/media",
    );

    expect(resolver.resolve(path)).toBe(`https://front.example.com/api/media/${path.value}`);
  });

  it("公開URLベース未設定のままpathを解決しない", () => {
    const resolver: ITopImageUrlResolver = new TopImageUrlResolverImpl("");

    expect(() => resolver.resolve(path)).toThrow("トップ画像の公開URLベースが設定されていません。");
  });
});
