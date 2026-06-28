import nodeConfig from "config";
import { parseAppConfig } from "./app_config";
import type { ConfigProvider } from "./i_config_provider";

export class NodeConfigProvider implements ConfigProvider {
  load() {
    return parseAppConfig({
      auth: nodeConfig.get<unknown>("auth"),
    });
  }
}
