import { IMemberRepository } from "../../domain/member/i_member_repository";
import { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { UUID } from "../../domain/shared/vo/uuid";
import { NotFoundError } from "../shared/exception/application_error";
import type { ITopImageUrlResolver } from "../shared/i_top_image_url_resolver";
import { FindMyMemberAppServiceDto } from "./find_my_member_app_service_dto";

export class FindMyMemberAppService {
  constructor(
    private readonly _memberRepository: IMemberRepository,
    private readonly _profileRepository: IProfileRepository,
    private readonly _topImageUrlResolver: ITopImageUrlResolver,
  ) {}

  async execute(viewerMemberId: string): Promise<FindMyMemberAppServiceDto> {
    const memberId = new UUID(viewerMemberId);

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
      topImageUrl: this._topImageUrlResolver.resolve(profile.topImagePath?.value ?? null),
    };
  }
}
