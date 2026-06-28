import { createDbFromDatabaseUrl } from "../Infra/Database/database";
import { NodeConfigProvider } from "./config/node_config_provider";
import { createApp } from "./create_app";

const db = createDbFromDatabaseUrl();
const appConfig = new NodeConfigProvider().load();

export default createApp(db, appConfig);
