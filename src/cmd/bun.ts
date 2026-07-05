import { createDbFromDatabaseUrl } from "../infra/database/database";
import { LocalObjectStorageImpl } from "../infra/object_storage/local_object_storage_impl";
import { TopImageUrlResolverImpl } from "../infra/shared/top_image_url_resolver_impl";
import { NodeConfigProvider } from "./config/node_config_provider";
import { createApp } from "./index";

const db = createDbFromDatabaseUrl();
const appConfig = new NodeConfigProvider().load();
const objectStorage = new LocalObjectStorageImpl(appConfig.objectStorage.localRootDir);
const topImageUrlResolver = new TopImageUrlResolverImpl(appConfig.media.publicBaseUrl);

export default createApp(db, appConfig, {
  objectStorage,
  topImageUrlResolver,
});
