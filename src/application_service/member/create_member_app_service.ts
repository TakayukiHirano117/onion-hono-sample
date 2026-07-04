import { IMemberRepository } from "../../domain/member/i_member_repository";
import type { IMemberDomainService } from "../../domain/member/i_member_domain_service";
import { Member } from "../../domain/member/member";
import { Name } from "../../domain/member/vo/name";
import { Bio } from "../../domain/profile/vo/bio";
import { Gender } from "../../domain/profile/vo/gender";
import { BirthDate } from "../../domain/profile/vo/birth_date";
import { TopImagePath } from "../../domain/profile/vo/top_image_path";
import { TopImageUpload } from "../../domain/profile/vo/top_image_upload";
import { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { Profile } from "../../domain/profile/profile";
import { Email } from "../../domain/shared/vo/email";
import { UUID } from "../../domain/shared/vo/uuid";
import type { ITransactionManager } from "../../infra/shared/i_transaction_manager";
import { UUIDGenerator } from "../../infra/shared/uuid_generator";
import { IPasswordHashGenerator } from "../../infra/shared/i_password_hash_generator";
import type { IObjectStorage } from "../shared/i_object_storage";

type CreateMemberTopImageInput = {
  bytes: Uint8Array;
  contentType: string;
};

type CreateMemberInput = {
  name: string;
  email: string;
  rawPassword: string;
  bio: string;
  gender: string;
  birthDate: string;
  topImage?: CreateMemberTopImageInput | null;
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

  async execute(input: CreateMemberInput): Promise<void> {
    const email = new Email(input.email);
    await this._memberDomainService.isEmailAlreadyRegistered(email);

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

    if (input.topImage) {
      await this.saveTopImage(member.id, input.topImage);
    }
  }

  private async saveTopImage(
    memberId: UUID,
    topImage: CreateMemberTopImageInput,
  ): Promise<void> {
    const upload = new TopImageUpload(topImage.bytes, topImage.contentType);
    const path = TopImagePath.forMember(memberId, upload.extension());

    await this._objectStorage.put(path.value, upload.bytes, upload.contentType);
    await this._profileRepository.updateTopImagePath(memberId, path);
  }
}
