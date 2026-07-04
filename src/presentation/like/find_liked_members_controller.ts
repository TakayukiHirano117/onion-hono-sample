import { FindLikedMembersAppService } from "../../application_service/like/find_liked_members_app_service";
import type { AppEnv } from "../../cmd/types/app_env";
import { Context } from "hono";

export class FindLikedMembersController {
  constructor(private readonly _findLikedMembersAppService: FindLikedMembersAppService) {}

  async handle(c: Context<AppEnv>) {
    const viewerMemberId = c.get("memberId");
    const members = await this._findLikedMembersAppService.execute(viewerMemberId);
    return c.json(members ?? [], 200);
  }
}
