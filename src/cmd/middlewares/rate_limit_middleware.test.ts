import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import {
  ApplicationError,
  ApplicationErrorCode,
  TooManyRequestsError,
} from "../../application_service/shared/exception/application_error";
import type { AppEnv } from "../types/app_env";
import {
  createRateLimitMiddleware,
  extractClientIp,
} from "./rate_limit_middleware";

function createTestApp(options: {
  limit: number;
  windowMs: number;
  now: () => number;
  store?: Map<string, { count: number; resetAt: number }>;
}) {
  const app = new Hono<AppEnv>();
  app.use(
    "*",
    createRateLimitMiddleware({
      name: "test",
      limit: options.limit,
      windowMs: options.windowMs,
      now: options.now,
      store: options.store,
    }),
  );
  app.get("/ping", (c) => c.json({ ok: true }));
  app.onError((err, c) => {
    if (err instanceof ApplicationError) {
      return c.json(
        { success: false, error: err.code, message: err.message },
        err.code === ApplicationErrorCode.TOO_MANY_REQUESTS ? 429 : 400,
      );
    }
    throw err;
  });
  return app;
}

describe("extractClientIp", () => {
  it("X-Forwarded-For の先頭 IP を返す", async () => {
    const app = new Hono();
    app.get("/", (c) => c.text(extractClientIp(c)));

    const response = await app.request("/", {
      headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
    });

    expect(await response.text()).toBe("203.0.113.10");
  });

  it("ヘッダが無いときは unknown を返す", async () => {
    const app = new Hono();
    app.get("/", (c) => c.text(extractClientIp(c)));

    const response = await app.request("/");
    expect(await response.text()).toBe("unknown");
  });
});

describe("createRateLimitMiddleware", () => {
  it("制限内のリクエストを許可する", async () => {
    const current = 1_000;
    const app = createTestApp({
      limit: 2,
      windowMs: 1_000,
      now: () => current,
    });

    const first = await app.request("/ping", {
      headers: { "x-forwarded-for": "198.51.100.1" },
    });
    const second = await app.request("/ping", {
      headers: { "x-forwarded-for": "198.51.100.1" },
    });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });

  it("制限を超えたら TooManyRequestsError 相当の 429 を返す", async () => {
    const current = 1_000;
    const app = createTestApp({
      limit: 2,
      windowMs: 1_000,
      now: () => current,
    });

    await app.request("/ping", { headers: { "x-forwarded-for": "198.51.100.2" } });
    await app.request("/ping", { headers: { "x-forwarded-for": "198.51.100.2" } });
    const limited = await app.request("/ping", {
      headers: { "x-forwarded-for": "198.51.100.2" },
    });

    expect(limited.status).toBe(429);
    const body = await limited.json();
    expect(body.error).toBe(ApplicationErrorCode.TOO_MANY_REQUESTS);
  });

  it("窓が切れたらカウンタをリセットする", async () => {
    let current = 1_000;
    const app = createTestApp({
      limit: 1,
      windowMs: 500,
      now: () => current,
    });

    const first = await app.request("/ping", {
      headers: { "x-forwarded-for": "198.51.100.3" },
    });
    expect(first.status).toBe(200);

    const blocked = await app.request("/ping", {
      headers: { "x-forwarded-for": "198.51.100.3" },
    });
    expect(blocked.status).toBe(429);

    current = 1_600;
    const afterReset = await app.request("/ping", {
      headers: { "x-forwarded-for": "198.51.100.3" },
    });
    expect(afterReset.status).toBe(200);
  });

  it("IP ごとに独立して数える", async () => {
    const current = 1_000;
    const app = createTestApp({
      limit: 1,
      windowMs: 1_000,
      now: () => current,
    });

    const a = await app.request("/ping", {
      headers: { "x-forwarded-for": "198.51.100.4" },
    });
    const b = await app.request("/ping", {
      headers: { "x-forwarded-for": "198.51.100.5" },
    });

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
  });

  it("methods 指定時は対象メソッド以外をスキップする", async () => {
    const app = new Hono<AppEnv>();
    app.use(
      "*",
      createRateLimitMiddleware({
        name: "post-only",
        limit: 1,
        windowMs: 1_000,
        methods: ["POST"],
        now: () => 1_000,
      }),
    );
    app.get("/ping", (c) => c.json({ ok: true }));
    app.post("/ping", (c) => c.json({ ok: true }));
    app.onError((err, c) => {
      if (err instanceof TooManyRequestsError) {
        return c.json({ error: err.code }, 429);
      }
      throw err;
    });

    expect((await app.request("/ping")).status).toBe(200);
    expect((await app.request("/ping")).status).toBe(200);
    expect((await app.request("/ping", { method: "POST" })).status).toBe(200);
    expect((await app.request("/ping", { method: "POST" })).status).toBe(429);
  });
});
