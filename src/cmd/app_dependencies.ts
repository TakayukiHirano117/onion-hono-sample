import type { IObjectStorage } from "../application_service/shared/i_object_storage";
import type { ITopImageUrlResolver } from "../application_service/shared/i_top_image_url_resolver";

export type AppDependencies = {
  objectStorage: IObjectStorage;
  topImageUrlResolver: ITopImageUrlResolver;
};
