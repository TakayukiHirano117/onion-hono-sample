import nodeConfig from "config";
import { z } from "zod";

const configSchema = z.object({
  auth: z.object({
    cookie: z.object({
      secure: z.boolean(),
    }),
  }),
});

export const config = configSchema.parse({
  auth: nodeConfig.get<unknown>("auth"),
});
