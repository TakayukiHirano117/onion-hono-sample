import { FindAllMemberAppService } from "../../application_service/member/find_all_member_app_service";
import type { AppEnv } from "../../cmd/types/app_env";
import { Context } from "hono";

export class FindAllMemberController {
  constructor(private readonly _findAllMemberAppService: FindAllMemberAppService) {}

  async handle(c: Context<AppEnv>) {
    const viewerMemberId = c.get("memberId");
    const members = await this._findAllMemberAppService.execute(viewerMemberId);
    return c.json(members);
  }
}
