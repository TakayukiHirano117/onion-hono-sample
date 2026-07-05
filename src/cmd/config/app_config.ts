import { z } from "zod";

const configSchema = z.object({
  auth: z.object({
    cookie: z.object({
      secure: z.boolean(),
    }),
  }),
  media: z.object({
    publicBaseUrl: z.string().url(),
  }),
  objectStorage: z.object({
    localRootDir: z.string().min(1),
  }),
});

export type AppConfig = z.infer<typeof configSchema>;

export function parseAppConfig(raw: unknown): AppConfig {
  return configSchema.parse(raw);
}
