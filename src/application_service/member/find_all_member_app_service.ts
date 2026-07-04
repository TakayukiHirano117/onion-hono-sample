import { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { UUID } from "../../domain/shared/vo/uuid";
import { NotFoundError } from "../shared/exception/application_error";
import { FindAllMemberAppServiceDto } from "./find_all_member_app_service_dto";
import { IFindDiscoverableMembersQueryService } from "./i_find_discoverable_members_query_service";

export class FindAllMemberAppService {
  constructor(
    private readonly _profileRepository: IProfileRepository,
    private readonly _findDiscoverableMembersQueryService: IFindDiscoverableMembersQueryService,
  ) {}

  async execute(viewerMemberId: string): Promise<FindAllMemberAppServiceDto[]> {
    const viewerId = new UUID(viewerMemberId);

    const viewerProfile = await this._profileRepository.findByMemberId(viewerId);
    if (!viewerProfile) {
      throw new NotFoundError("プロフィールが存在しません。");
    }

    return this._findDiscoverableMembersQueryService.execute({
      viewerMemberId,
      genders: viewerProfile.gender.discoveryTargetGenders(),
    });
  }
}
