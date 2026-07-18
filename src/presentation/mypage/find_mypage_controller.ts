import { Context } from "hono";
import { FindMypageAppService } from "../../application_service/member/find_mypage_app_service";
import type { AppEnv } from "../../cmd/types/app_env";

export class FindMypageController {
  constructor(private readonly _findMypageAppService: FindMypageAppService) {}

  async handle(c: Context<AppEnv>) {
    const viewerMemberId = c.get("memberId");
    const member = await this._findMypageAppService.execute(viewerMemberId);
    return c.json(member);
  }
}
