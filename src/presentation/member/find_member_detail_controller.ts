import { Context } from "hono";
import { FindMemberDetailAppService } from "../../application_service/member/find_member_detail_app_service";
import type { AppEnv } from "../../cmd/types/app_env";

export class FindMemberDetailController {
  constructor(private readonly _findMemberDetailAppService: FindMemberDetailAppService) {}

  async handle(c: Context<AppEnv>) {
    const memberId = c.req.param("memberId");
    const viewerMemberId = c.get("memberId");
    const member = await this._findMemberDetailAppService.execute({
      memberId,
      viewerMemberId,
    });

    return c.json(member);
  }
}
