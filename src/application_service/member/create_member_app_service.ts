import { IMemberRepository } from "../../domain/member/i_member_repository";
import type { IMemberDomainService } from "../../domain/member/i_member_domain_service";
import { Member } from "../../domain/member/member";
import { Name } from "../../domain/member/vo/name";
import { Bio } from "../../domain/profile/vo/bio";
import { Gender } from "../../domain/profile/vo/gender";
import { BirthDate } from "../../domain/profile/vo/birth_date";
import { TopImagePath } from "../../domain/profile/vo/top_image_path";
import type { TopImageUpload } from "../../domain/profile/vo/top_image_upload";
import { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { Profile } from "../../domain/profile/profile";
import { Email } from "../../domain/shared/vo/email";
import { UUID } from "../../domain/shared/vo/uuid";
import type { IObjectStorage } from "../shared/i_object_storage";
import type { ITransactionManager } from "../../infra/shared/i_transaction_manager";
import { UUIDGenerator } from "../../infra/shared/uuid_generator";
import { IPasswordHashGenerator } from "../../infra/shared/i_password_hash_generator";

type RequestDto = {
  name: string;
  email: string;
  rawPassword: string;
  bio: string;
  gender: string;
  birthDate: string;
  topImage?: TopImageUpload | null;
};

export class CreateMemberAppService {
  constructor(
    private readonly _memberRepository: IMemberRepository,
    private readonly _memberDomainService: IMemberDomainService,
    private readonly _profileRepository: IProfileRepository,
    private readonly _transactionManager: ITransactionManager,
    private readonly _passwordHashGenerator: IPasswordHashGenerator,
    private readonly _uuidGenerator: UUIDGenerator,
    private readonly _objectStorage: IObjectStorage,
  ) {}

  async execute(input: RequestDto): Promise<void> {
    const email = new Email(input.email);
    await this._memberDomainService.isEmailAlreadyRegistered(email);

    const member = Member.create(
      new UUID(this._uuidGenerator.execute()),
      new Name(input.name),
      email,
    );

    const passwordHash = await this._passwordHashGenerator.execute(input.rawPassword);

    let topImagePath: TopImagePath | null = null;

    if (input.topImage) {
      topImagePath = TopImagePath.forMember(member.id.value, input.topImage.extension());
      await this._objectStorage.put(
        topImagePath.value,
        input.topImage.bytes,
        input.topImage.contentType,
      );
    }

    const profile = Profile.create(
      member.id,
      new Bio(input.bio),
      new Gender(input.gender),
      new BirthDate(input.birthDate),
      topImagePath,
    );

    try {
      await this._transactionManager.runInTransaction(async (tx) => {
        await this._memberRepository.create(member, passwordHash, tx);
        await this._profileRepository.create(profile, tx);
      });
    } catch (error) {
      if (topImagePath) {
        await this._objectStorage.delete(topImagePath.value);
      }

      throw error;
    }
  }
}
