import type { ITopImageUrlResolver } from "../../application_service/shared/i_top_image_url_resolver";

export class TopImageUrlResolverImpl implements ITopImageUrlResolver {
  constructor(private readonly _mediaBaseUrl: string) {}

  resolve(path: string | null): string | null {
    if (path === null) {
      return null;
    }

    const baseUrl = this._mediaBaseUrl.replace(/\/$/, "");
    return `${baseUrl}/${path}`;
  }
}
