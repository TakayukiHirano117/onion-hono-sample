import { createDbFromDatabaseUrl } from "../infra/database/database";
import { NodeConfigProvider } from "./config/node_config_provider";
import { createApp } from "./index";

const db = createDbFromDatabaseUrl();
const appConfig = new NodeConfigProvider().load();

export default createApp(db, appConfig);
