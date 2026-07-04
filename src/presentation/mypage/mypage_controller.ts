import { Context } from "hono";
import { Hono } from "hono";
import type { AuthMiddleware } from "../../cmd/middlewares/members/auth_middeware";
import { FindMyMemberController } from "./find_my_member_controller";

export class MypageController {
  constructor(
    private readonly _findMyMemberController: FindMyMemberController,
    private readonly _authMiddleware: AuthMiddleware,
  ) {}

  setUpRoutes = () => {
    const router = new Hono();

    router.get("/", this._authMiddleware.handle, (c: Context) =>
      this._findMyMemberController.handle(c),
    );

    return router;
  };
}
