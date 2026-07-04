import { createDb } from "../infra/database/database";
import { R2ObjectStorageImpl } from "../infra/object_storage/r2_object_storage_impl";
import { TopImageUrlResolverImpl } from "../infra/shared/top_image_url_resolver_impl";
import { EnvConfigProvider } from "./config/env_config_provider";
import { createApp } from "./index";

export type Env = {
  HYPERDRIVE: Hyperdrive;
  AUTH_COOKIE_SECURE: string;
  MEDIA_BASE_URL: string;
  PHOTOS: R2Bucket;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const db = createDb(env.HYPERDRIVE.connectionString);

    try {
      const appConfig = new EnvConfigProvider(env).load();
      const app = createApp(db, appConfig, {
        objectStorage: new R2ObjectStorageImpl(env.PHOTOS),
        topImageUrlResolver: new TopImageUrlResolverImpl(appConfig.media.baseUrl),
      });
      return await app.fetch(request, env);
    } finally {
      await db.destroy();
    }
  },
};
