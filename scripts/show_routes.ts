import { showRoutes } from "hono/dev";
import { createApp } from "../src/cmd/index";
import { NodeConfigProvider } from "../src/cmd/config/node_config_provider";
import { createDbFromDatabaseUrl } from "../src/infra/database/database";
import { LocalObjectStorageImpl } from "../src/infra/object_storage/local_object_storage_impl";
import { TopImageUrlResolverImpl } from "../src/infra/shared/top_image_url_resolver_impl";

const db = createDbFromDatabaseUrl();
const appConfig = new NodeConfigProvider().load();
const app = createApp(db, appConfig, {
  objectStorage: new LocalObjectStorageImpl(appConfig.objectStorage.localRootDir),
  topImageUrlResolver: new TopImageUrlResolverImpl(appConfig.media.publicBaseUrl),
});

showRoutes(app);
await db.destroy();
