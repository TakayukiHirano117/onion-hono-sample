import { IMemberRepository } from "../../Domain/Member/i_member_repository";
import { Member } from "../../Domain/Member/member";
import { Name } from "../../Domain/Member/vo/name";
import { Bio } from "../../Domain/Profile/vo/bio";
import { Gender } from "../../Domain/Profile/vo/gender";
import { BirthDate } from "../../Domain/Profile/vo/birth_date";
import { IProfileRepository } from "../../Domain/Profile/i_profile_repository";
import { Profile } from "../../Domain/Profile/profile";
import { Email } from "../../Domain/shared/vo/email";
import { UUID } from "../../Domain/shared/vo/uuid";
import type { ITransactionManager } from "../../Infra/shared/i_transaction_manager";
import { UUIDGenerator } from "../../Infra/shared/uuid_generator";
import { IPasswordHashGenerator } from "../../Infra/shared/i_password_hash_generator";

type CreateMemberInput = {
  name: string;
  email: string;
  rawPassword: string;
  bio: string;
  gender: string;
  birthDate: string;
};

export class CreateMemberAppService {
  constructor(
    private readonly _memberRepository: IMemberRepository,
    private readonly _profileRepository: IProfileRepository,
    private readonly _transactionManager: ITransactionManager,
    private readonly _passwordHashGenerator: IPasswordHashGenerator,
    private readonly _uuidGenerator: UUIDGenerator
  ) {}

  async execute(input: CreateMemberInput): Promise<void> {
    const member = Member.create(
      new UUID(this._uuidGenerator.execute()),
      new Name(input.name),
      new Email(input.email),
    );

    const passwordHash = await this._passwordHashGenerator.execute(input.rawPassword);

    const profile = Profile.create(
      member.id,
      new Bio(input.bio),
      new Gender(input.gender),
      new BirthDate(input.birthDate),
    );

    await this._transactionManager.runInTransaction(async (tx) => {
      // [must]メンバー保存用DTOを作る
      await this._memberRepository.create(member, passwordHash, tx);
      await this._profileRepository.create(profile, tx);
    });
  }
}
