import { IMemberRepository } from "../../domain/member/i_member_repository";
import { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { UUID } from "../../domain/shared/vo/uuid";
import { NotFoundError } from "../shared/exception/application_error";
import { FindMemberDetailAppServiceDto } from "./find_member_detail_app_service_dto";

type FindMemberDetailInput = {
  memberId: string;
};

export class FindMemberDetailAppService {
  constructor(
    private readonly _memberRepository: IMemberRepository,
    private readonly _profileRepository: IProfileRepository,
  ) {}

  async execute(input: FindMemberDetailInput): Promise<FindMemberDetailAppServiceDto> {
    const memberId = new UUID(input.memberId);

    const member = await this._memberRepository.findById(memberId);
    if (!member) {
      throw new NotFoundError("会員が存在しません。");
    }

    const profile = await this._profileRepository.findByMemberId(memberId);
    if (!profile) {
      throw new NotFoundError("プロフィールが存在しません。");
    }

    return {
      id: member.id.value,
      name: member.name.value,
      email: member.email.value,
      bio: profile.bio.value,
      gender: profile.gender.value,
      birthDate: profile.birthDate.value,
    };
  }
}
