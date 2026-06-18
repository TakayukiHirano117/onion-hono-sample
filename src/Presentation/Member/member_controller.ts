import { FindAllMemberController } from "./find_all_member_controller";
import { Context } from "hono";

export class MemberController {
  constructor(
    private readonly _findAllMemberController: FindAllMemberController,
  ) {}

  setUpRoutes = (c: Context) => {
    this._findAllMemberController.handle(c);
  };
}
