import { S3Client } from "@aws-sdk/client-s3";
import { showRoutes } from "hono/dev";
import { createApp } from "../src/cmd/index";
import { NodeConfigProvider } from "../src/cmd/config/node_config_provider";
import { createDbFromDatabaseUrl } from "../src/infra/database/database";
import { LocalObjectStorageImpl } from "../src/infra/shared/local_object_storage_impl";
import { S3ImageUploaderImpl } from "../src/infra/shared/s3_image_uploader_impl";
import { TopImageUrlResolverImpl } from "../src/infra/shared/top_image_url_resolver_impl";

const db = createDbFromDatabaseUrl();
const appConfig = new NodeConfigProvider().load();
const directTopImageUpload =
  process.env.AWS_REGION && process.env.AWS_S3_BUCKET && process.env.CLOUDFRONT_PUBLIC_BASE_URL
    ? {
        imageUploader: new S3ImageUploaderImpl(
          new S3Client({ region: process.env.AWS_REGION }),
          process.env.AWS_S3_BUCKET,
        ),
        topImageUrlResolver: new TopImageUrlResolverImpl(process.env.CLOUDFRONT_PUBLIC_BASE_URL),
      }
    : undefined;
const app = createApp(db, appConfig, {
  directTopImageUpload,
  objectStorage: new LocalObjectStorageImpl(appConfig.objectStorage.localRootDir),
  topImageUrlResolver: new TopImageUrlResolverImpl(appConfig.media.publicBaseUrl),
});

showRoutes(app);
await db.destroy();
