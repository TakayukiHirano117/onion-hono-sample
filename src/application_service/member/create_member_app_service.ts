import { IMemberRepository } from "../../domain/member/i_member_repository";
import { Member } from "../../domain/member/member";
import { Name } from "../../domain/member/vo/name";
import { Bio } from "../../domain/profile/vo/bio";
import { Gender } from "../../domain/profile/vo/gender";
import { BirthDate } from "../../domain/profile/vo/birth_date";
import { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { Profile } from "../../domain/profile/profile";
import { Email } from "../../domain/shared/vo/email";
import { UUID } from "../../domain/shared/vo/uuid";
import type { ITransactionManager } from "../../infra/shared/i_transaction_manager";
import { UUIDGenerator } from "../../infra/shared/uuid_generator";
import { IPasswordHashGenerator } from "../../infra/shared/i_password_hash_generator";
import { ConflictError } from "../shared/exception/application_error";

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
    const email = new Email(input.email);
    const existingMember = await this._memberRepository.findByEmail(email);
    if (existingMember) {
      throw new ConflictError("このメールアドレスは既に登録されています。");
    }

    const member = Member.create(
      new UUID(this._uuidGenerator.execute()),
      new Name(input.name),
      email,
    );

    const passwordHash = await this._passwordHashGenerator.execute(input.rawPassword);

    const profile = Profile.create(
      member.id,
      new Bio(input.bio),
      new Gender(input.gender),
      new BirthDate(input.birthDate),
    );

    await this._transactionManager.runInTransaction(async (tx) => {
      await this._memberRepository.create(member, passwordHash, tx);
      await this._profileRepository.create(profile, tx);
    });
  }
}
