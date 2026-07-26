import { S3Client } from "@aws-sdk/client-s3";
import { createDbFromDatabaseUrl } from "../infra/database/database";
import { LocalObjectStorageImpl } from "../infra/shared/local_object_storage_impl";
import { S3ImageUploaderImpl } from "../infra/shared/s3_image_uploader_impl";
import { TopImageUrlResolverImpl } from "../infra/shared/top_image_url_resolver_impl";
import { NodeConfigProvider } from "./config/node_config_provider";
import { createApp } from "./index";

const db = createDbFromDatabaseUrl();
const appConfig = new NodeConfigProvider().load();

const awsRegion = process.env.AWS_REGION;
const awsS3Bucket = process.env.AWS_S3_BUCKET;
const cloudFrontBaseUrl =
  process.env.CLOUDFRONT_PUBLIC_BASE_URL ?? appConfig.media.publicBaseUrl;

const objectStorage = new LocalObjectStorageImpl(appConfig.objectStorage.localRootDir);

const directTopImageUpload =
  awsRegion && awsS3Bucket
    ? {
        imageUploader: new S3ImageUploaderImpl(new S3Client({ region: awsRegion }), awsS3Bucket),
        topImageUrlResolver: new TopImageUrlResolverImpl(cloudFrontBaseUrl),
      }
    : undefined;

const topImageUrlResolver =
  directTopImageUpload?.topImageUrlResolver ??
  new TopImageUrlResolverImpl(appConfig.media.publicBaseUrl);

export default createApp(db, appConfig, {
  directTopImageUpload,
  objectStorage,
  topImageUrlResolver,
});
