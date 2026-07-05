import type { ITopImageUrlResolver } from "../../application_service/shared/i_top_image_url_resolver";
import type { TopImagePath } from "../../domain/profile/vo/top_image_path";

export class StubTopImageUrlResolver implements ITopImageUrlResolver {
  constructor(private readonly _baseUrl = "http://localhost:3001/api/media") {}

  resolve(path: TopImagePath | null): string | null {
    if (!path) {
      return null;
    }

    return `${this._baseUrl.replace(/\/$/, "")}/${path.value}`;
  }
}
