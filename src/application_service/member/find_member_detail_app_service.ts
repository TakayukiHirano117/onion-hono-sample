import { ILikeRepository } from "../../domain/like/i_like_repository";
import { IMemberRepository } from "../../domain/member/i_member_repository";
import { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { UUID } from "../../domain/shared/vo/uuid";
import { NotFoundError } from "../shared/exception/application_error";
import type { ITopImageUrlResolver } from "../shared/i_top_image_url_resolver";
import { FindMemberDetailAppServiceDto } from "./find_member_detail_app_service_dto";

type FindMemberDetailInput = {
  memberId: string;
  viewerMemberId: string;
};

export class FindMemberDetailAppService {
  constructor(
    private readonly _memberRepository: IMemberRepository,
    private readonly _profileRepository: IProfileRepository,
    private readonly _likeRepository: ILikeRepository,
    private readonly _topImageUrlResolver: ITopImageUrlResolver,
  ) {}

  async execute(input: FindMemberDetailInput): Promise<FindMemberDetailAppServiceDto> {
    const memberId = new UUID(input.memberId);
    const viewerMemberId = new UUID(input.viewerMemberId);

    const member = await this._memberRepository.findById(memberId);
    if (!member) {
      throw new NotFoundError("会員が存在しません。");
    }

    const profile = await this._profileRepository.findByMemberId(memberId);
    if (!profile) {
      throw new NotFoundError("プロフィールが存在しません。");
    }

    const hasLiked = await this._likeRepository.exists(viewerMemberId, memberId);

    return {
      id: member.id.value,
      name: member.name.value,
      email: member.email.value,
      bio: profile.bio.value,
      gender: profile.gender.value,
      birthDate: profile.birthDate.value,
      hasLiked,
      topImageUrl: this._topImageUrlResolver.resolve(profile.topImagePath),
    };
  }
}
