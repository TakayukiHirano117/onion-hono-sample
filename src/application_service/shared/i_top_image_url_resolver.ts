import type { TopImagePath } from "../../domain/profile/vo/top_image_path";

export interface ITopImageUrlResolver {
  resolve(path: TopImagePath | null): string | null;
}
