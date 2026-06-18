import { FindAllMemberController } from "./find_all_member_controller";
import { Context } from "hono";
import { Hono } from "hono";
import { CreateMemberController } from "./create_member_controller";

export class MemberController {
  private readonly route: Hono;

  constructor(
    private readonly _findAllMemberController: FindAllMemberController,
    private readonly _createMemberController: CreateMemberController,
  ) {
    this.route = new Hono();
  }

  setUpRoutes = () => {
    this.route.get("/", (c: Context) =>
      this._findAllMemberController.handle(c),
    );

    this.route.post("/", (c: Context) =>
      this._createMemberController.handle(c),
    );

    return this.route;
  };
}
