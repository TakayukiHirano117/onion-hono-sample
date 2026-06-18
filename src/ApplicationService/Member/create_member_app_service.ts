import { IMemberRepository } from "../../Domain/Member/i_member_repository";
import { Member } from "../../Domain/Member/member";
import { Name } from "../../Domain/Member/vo/name";
import { IProfileRepository } from "../../Domain/Profile/i_profile_repository";
import { Profile } from "../../Domain/Profile/profile";
import { Email } from "../../Domain/shared/vo/email";
import { UUID } from "../../Domain/shared/vo/uuid";
import type { ITransactionManager } from "../../Infra/shared/i_transaction_manager";
import { UUIDGenerator } from "../../Infra/shared/uuid_generator";

type CreateMemberInput = {
  name: string;
  email: string;
};

export class CreateMemberAppService {
  constructor(
    private readonly _memberRepository: IMemberRepository,
    private readonly _profileRepository: IProfileRepository,
    private readonly _transactionManager: ITransactionManager,
  ) {}

  async execute(input: CreateMemberInput): Promise<void> {
    const member = new Member(
      new UUID(UUIDGenerator.generate()),
      new Name(input.name),
      new Email(input.email),
    );
    const profile = Profile.createEmpty(member.id);

    await this._transactionManager.runInTransaction(async (tx) => {
      await this._memberRepository.create(member, tx);
      await this._profileRepository.create(profile, tx);
    });
  }
}
