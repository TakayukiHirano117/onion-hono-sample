import { Context } from "hono";
import { Hono } from "hono";
import type { AuthMiddleware } from "../../cmd/middlewares/members/auth_middeware";
import { FindMyMemberController } from "./find_my_member_controller";
import { UploadTopImageController } from "./upload_top_image_controller";

export class MypageController {
  constructor(
    private readonly _findMyMemberController: FindMyMemberController,
    private readonly _uploadTopImageController: UploadTopImageController,
    private readonly _authMiddleware: AuthMiddleware,
  ) {}

  setUpRoutes = () => {
    const router = new Hono();

    router.get("/", this._authMiddleware.handle, (c: Context) =>
      this._findMyMemberController.handle(c),
    );

    router.post("/top-image", this._authMiddleware.handle, (c: Context) =>
      this._uploadTopImageController.handle(c),
    );

    return router;
  };
}
