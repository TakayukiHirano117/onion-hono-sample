import type { AppConfig } from "./app_config";

export interface ConfigProvider {
  load(): AppConfig;
}
