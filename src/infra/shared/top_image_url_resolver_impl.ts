import type { ITopImageUrlResolver } from "../../application_service/shared/i_top_image_url_resolver";
import type { TopImagePath } from "../../domain/profile/vo/top_image_path";

export class TopImageUrlResolverImpl implements ITopImageUrlResolver {
  constructor(private readonly _publicBaseUrl: string) {}

  resolve(path: TopImagePath | null): string | null {
    if (!path) {
      return null;
    }

    const baseUrl = this._publicBaseUrl.replace(/\/$/, "");
    return `${baseUrl}/${path.value}`;
  }
}
