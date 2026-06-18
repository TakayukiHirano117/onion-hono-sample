import { FindAllMemberController } from "./find_all_member_controller";
import { Context } from "hono";
import { Hono } from "hono";

export class MemberController {
  private readonly route: Hono;

  constructor(
    private readonly _findAllMemberController: FindAllMemberController,
  ) {
    this.route = new Hono();
  }

  setUpRoutes = () => {
    this.route.get("/", (c: Context) =>
      this._findAllMemberController.handle(c),
    );

    return this.route;
  };
}
