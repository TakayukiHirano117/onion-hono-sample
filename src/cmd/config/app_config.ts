import { z } from "zod";

const configSchema = z.object({
  auth: z.object({
    cookie: z.object({
      secure: z.boolean(),
    }),
  }),
});

export type AppConfig = z.infer<typeof configSchema>;

export function parseAppConfig(raw: unknown): AppConfig {
  return configSchema.parse(raw);
}
