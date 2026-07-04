import type { ITopImageUrlResolver } from "../shared/i_top_image_url_resolver";

export class StubTopImageUrlResolver implements ITopImageUrlResolver {
  resolve(path: string | null): string | null {
    if (path === null) {
      return null;
    }

    return `http://localhost:3000/api/v1/media/${path}`;
  }
}
