import { FindAllMemberController } from "./find_all_member_controller";
import { Context } from "hono";
import { Hono } from "hono";
import { CreateMemberController } from "./create_member_controller";

export class MemberController {
  constructor(
    private readonly _findAllMemberController: FindAllMemberController,
    private readonly _createMemberController: CreateMemberController,
  ) {}

  setUpRoutes = () => {
    const router = new Hono();

    router.get("/", (c: Context) =>
      this._findAllMemberController.handle(c),
    );

    router.post("/", (c: Context) =>
      this._createMemberController.handle(c),
    );

    return router;
  };
}
