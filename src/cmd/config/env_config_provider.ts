import { parseAppConfig } from "./app_config";
import type { ConfigProvider } from "./i_config_provider";

export type WorkerEnv = {
  AUTH_COOKIE_SECURE: string;
  MEDIA_PUBLIC_BASE_URL: string;
};

export class EnvConfigProvider implements ConfigProvider {
  constructor(private readonly env: WorkerEnv) {}

  load() {
    return parseAppConfig({
      auth: {
        cookie: {
          secure: this.env.AUTH_COOKIE_SECURE === "true",
        },
      },
      media: {
        publicBaseUrl: this.env.MEDIA_PUBLIC_BASE_URL,
      },
      objectStorage: {
        localRootDir: ".storage",
      },
    });
  }
}
