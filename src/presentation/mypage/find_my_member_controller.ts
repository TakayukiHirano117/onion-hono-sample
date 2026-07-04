import { Context } from "hono";
import { FindMyMemberAppService } from "../../application_service/member/find_my_member_app_service";
import type { AppEnv } from "../../cmd/types/app_env";

export class FindMyMemberController {
  constructor(private readonly _findMyMemberAppService: FindMyMemberAppService) {}

  async handle(c: Context<AppEnv>) {
    const viewerMemberId = c.get("memberId");
    const member = await this._findMyMemberAppService.execute(viewerMemberId);
    return c.json(member);
  }
}
