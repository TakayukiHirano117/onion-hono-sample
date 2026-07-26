import { Hono, type Context } from "hono";
import type { AuthMiddleware } from "../../cmd/middlewares/members/auth_middeware";
import type { AppEnv } from "../../cmd/types/app_env";

type ActionController = {
  handle(c: Context<AppEnv>): Response | Promise<Response>;
};

export type DirectTopImageUploadControllers = {
  prepare: ActionController;
  complete: ActionController;
};

export class MypageController {
  constructor(
    private readonly _findMypageController: ActionController,
    private readonly _uploadTopImageController: ActionController,
    private readonly _directTopImageUploadControllers: DirectTopImageUploadControllers | null,
    private readonly _authMiddleware: Pick<AuthMiddleware, "handle">,
  ) {}

  setUpRoutes = () => {
    const router = new Hono<AppEnv>();

    router.get("/", this._authMiddleware.handle, (c) => this._findMypageController.handle(c));

    router.post("/top-image", this._authMiddleware.handle, (c) =>
      this._uploadTopImageController.handle(c),
    );

    const directTopImageUploadControllers = this._directTopImageUploadControllers;
    if (directTopImageUploadControllers) {
      router.post("/top-image/upload", this._authMiddleware.handle, (c) =>
        directTopImageUploadControllers.prepare.handle(c),
      );

      router.post("/top-image/upload/complete", this._authMiddleware.handle, (c) =>
        directTopImageUploadControllers.complete.handle(c),
      );
    }

    return router;
  };
}
