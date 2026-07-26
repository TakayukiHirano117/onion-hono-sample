import type { IObjectStorage } from "../application_service/shared/i_object_storage";
import type { ITopImageUrlResolver } from "../application_service/shared/i_top_image_url_resolver";
import type { IImageUploader } from "../infra/shared/i_image_uploader";

export type DirectTopImageUploadDependencies = {
  imageUploader: IImageUploader;
  topImageUrlResolver: ITopImageUrlResolver;
};

export type AppDependencies = {
  directTopImageUpload?: DirectTopImageUploadDependencies;
  objectStorage: IObjectStorage;
  topImageUrlResolver: ITopImageUrlResolver;
};
