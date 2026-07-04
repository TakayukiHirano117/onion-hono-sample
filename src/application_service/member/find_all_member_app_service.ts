import { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { UUID } from "../../domain/shared/vo/uuid";
import { NotFoundError } from "../shared/exception/application_error";
import type { ITopImageUrlResolver } from "../shared/i_top_image_url_resolver";
import { FindAllMemberAppServiceDto } from "./find_all_member_app_service_dto";
import { IFindDiscoverableMembersQueryService } from "./i_find_discoverable_members_query_service";

export class FindAllMemberAppService {
  constructor(
    private readonly _profileRepository: IProfileRepository,
    private readonly _findDiscoverableMembersQueryService: IFindDiscoverableMembersQueryService,
    private readonly _topImageUrlResolver: ITopImageUrlResolver,
  ) {}

  async execute(viewerMemberId: string): Promise<FindAllMemberAppServiceDto[]> {
    const viewerId = new UUID(viewerMemberId);

    const viewerProfile = await this._profileRepository.findByMemberId(viewerId);
    if (!viewerProfile) {
      throw new NotFoundError("プロフィールが存在しません。");
    }

    const members = await this._findDiscoverableMembersQueryService.execute({
      viewerMemberId,
      genders: viewerProfile.gender.discoveryTargetGenders(),
    });

    return members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      hasLiked: member.hasLiked,
      topImageUrl: this._topImageUrlResolver.resolve(member.topImagePath),
    }));
  }
}
