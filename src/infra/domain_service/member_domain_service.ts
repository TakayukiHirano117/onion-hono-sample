import type { IMemberDomainService } from "../../domain/member/i_member_domain_service";
import type { IMemberRepository } from "../../domain/member/i_member_repository";
import { InvariantViolationError } from "../../domain/shared/exception/domain_error";
import { Email } from "../../domain/shared/vo/email";

export class MemberDomainService implements IMemberDomainService {
  constructor(private readonly _memberRepository: IMemberRepository) {}

  async isEmailAlreadyRegistered(email: Email): Promise<void> {
    const member = await this._memberRepository.findByEmail(email);
    if (member) {
      throw new InvariantViolationError("このメールアドレスは既に登録されています。");
    }
  }
}
