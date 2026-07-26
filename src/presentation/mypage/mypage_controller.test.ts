import type { Context, MiddlewareHandler } from "hono";
import { describe, expect, it } from "vitest";
import type { AppEnv } from "../../cmd/types/app_env";
import { MypageController, type DirectTopImageUploadControllers } from "./mypage_controller";

const authHandle: MiddlewareHandler<AppEnv> = async (_c, next) => {
  await next();
};

const legacyAction = {
  async handle(c: Context) {
    return c.json({ status: "ok" }, 200);
  },
};

const directAction = {
  async handle(c: Context<AppEnv>) {
    return c.json({ status: "ok" }, 200);
  },
};

const hasPostRoute = (routes: ReadonlyArray<{ method: string; path: string }>, path: string) =>
  routes.some((route) => route.method === "POST" && route.path === path);

const createRouter = (directTopImageUploadControllers: DirectTopImageUploadControllers | null) =>
  new MypageController(legacyAction, legacyAction, directTopImageUploadControllers, {
    handle: authHandle,
  }).setUpRoutes();

describe("MypageController direct upload capability", () => {
  it("Local / Cloudflare legacy runtimeではS3 routeを登録しない", () => {
    const router = createRouter(null);

    expect(hasPostRoute(router.routes, "/top-image")).toBe(true);
    expect(hasPostRoute(router.routes, "/top-image/upload")).toBe(false);
    expect(hasPostRoute(router.routes, "/top-image/upload/complete")).toBe(false);
  });

  it("S3 uploaderとCloudFront resolverのController組がある場合だけrouteを登録する", () => {
    const router = createRouter({
      prepare: directAction,
      complete: directAction,
    });

    expect(hasPostRoute(router.routes, "/top-image/upload")).toBe(true);
    expect(hasPostRoute(router.routes, "/top-image/upload/complete")).toBe(true);
  });
});
