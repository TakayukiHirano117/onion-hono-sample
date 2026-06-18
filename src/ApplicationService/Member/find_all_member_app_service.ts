// ドメイン層とインフラ層のオブジェクトを使って組み立てる。

import { IMemberRepository } from "../../Domain/Member/i_member_repository";
import { Member } from "../../Domain/Member/member";

export class FindAllMemberAppService {
  constructor(
    private readonly _memberRepository: IMemberRepository,
  ) {}

  async execute(): Promise<Member[]> {
    return this._memberRepository.findAll()
  }
}