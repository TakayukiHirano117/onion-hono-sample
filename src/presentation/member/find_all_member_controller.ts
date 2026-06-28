import { FindAllMemberAppService } from "../../application_service/member/find_all_member_app_service";
import { Context } from "hono";

export class FindAllMemberController {
  constructor(private readonly _findAllMemberAppService: FindAllMemberAppService) {}

  async handle(c: Context) {
    const members = await this._findAllMemberAppService.execute();
    return c.json(members.map((member) => ({
      id: member.id.value,
      name: member.name.value,
      email: member.email.value,
    })));
  }
}