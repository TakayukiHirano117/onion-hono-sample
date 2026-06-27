// ドメイン層とインフラ層のオブジェクトを使って組み立てる。

import { IMemberRepository } from "../../Domain/Member/i_member_repository";
import { FindAllMemberAppServiceDto } from "./find_all_member_app_service_dto";

export class FindAllMemberAppService {
  constructor(
    private readonly _memberRepository: IMemberRepository,
  ) {}

  async execute(): Promise<FindAllMemberAppServiceDto[]> {
    const members = await this._memberRepository.findAll();
    const membersDto = members.map((member) => ({
      id: member.id.value,
      name: member.name.value,
      email: member.email.value,
    }));

    return membersDto;
  }
}