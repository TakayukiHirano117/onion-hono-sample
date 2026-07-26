import type { Context, MiddlewareHandler } from "hono";
import { TooManyRequestsError } from "../../application_service/shared/exception/application_error";
import type { AppEnv } from "../types/app_env";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitOptions = {
  name: string;
  limit: number;
  windowMs: number;
  methods?: readonly string[];
  now?: () => number;
  store?: Map<string, RateLimitBucket>;
};

export function extractClientIp(c: Context): string {
  const forwardedFor = c.req.header("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return "unknown";
}

export function createRateLimitMiddleware(
  options: RateLimitOptions,
): MiddlewareHandler<AppEnv> {
  const store = options.store ?? new Map<string, RateLimitBucket>();
  const now = options.now ?? Date.now;

  return async (c, next) => {
    if (options.methods && !options.methods.includes(c.req.method)) {
      await next();
      return;
    }

    const currentMs = now();
    const key = `${options.name}:${extractClientIp(c)}`;
    const existing = store.get(key);

    if (!existing || existing.resetAt <= currentMs) {
      store.set(key, { count: 1, resetAt: currentMs + options.windowMs });
      await next();
      return;
    }

    if (existing.count >= options.limit) {
      throw new TooManyRequestsError(
        "リクエストが多すぎます。しばらく時間をおいて再度お試しください。",
      );
    }

    existing.count += 1;
    store.set(key, existing);
    await next();
  };
}
