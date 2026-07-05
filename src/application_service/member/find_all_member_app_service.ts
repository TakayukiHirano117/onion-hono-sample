import { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { TopImagePath } from "../../domain/profile/vo/top_image_path";
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

    const rows = await this._findDiscoverableMembersQueryService.execute({
      viewerMemberId,
      genders: viewerProfile.gender.discoveryTargetGenders(),
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      hasLiked: row.hasLiked,
      topImageUrl: this._topImageUrlResolver.resolve(
        row.topImagePath ? new TopImagePath(row.topImagePath) : null,
      ),
    }));
  }
}
