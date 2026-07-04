import { Context } from "hono";
import { FindMemberDetailAppService } from "../../application_service/member/find_member_detail_app_service";

export class FindMemberDetailController {
  constructor(private readonly _findMemberDetailAppService: FindMemberDetailAppService) {}

  async handle(c: Context) {
    const memberId = c.req.param("memberId");
    const member = await this._findMemberDetailAppService.execute({ memberId });

    return c.json(member);
  }
}
