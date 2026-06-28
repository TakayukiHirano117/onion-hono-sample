import { createDb } from "../infra/database/database";
import { EnvConfigProvider } from "./config/env_config_provider";
import { createApp } from "./index";

export type Env = {
  HYPERDRIVE: Hyperdrive;
  AUTH_COOKIE_SECURE: string;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const db = createDb(env.HYPERDRIVE.connectionString);

    try {
      const appConfig = new EnvConfigProvider(env).load();
      const app = createApp(db, appConfig);
      return await app.fetch(request, env);
    } finally {
      await db.destroy();
    }
  },
};
