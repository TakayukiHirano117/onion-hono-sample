import { FindLikedMembersAppServiceDto } from "./find_liked_members_app_service_dto";
import { IFindLikedMembersQueryService } from "./i_find_liked_members_query_service";
import type { ITopImageUrlResolver } from "../shared/i_top_image_url_resolver";

export class FindLikedMembersAppService {
  constructor(
    private readonly _findLikedMembersQueryService: IFindLikedMembersQueryService,
    private readonly _topImageUrlResolver: ITopImageUrlResolver,
  ) {}

  async execute(viewerMemberId: string): Promise<FindLikedMembersAppServiceDto[]> {
    const members = await this._findLikedMembersQueryService.execute(viewerMemberId);

    return members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      hasLiked: member.hasLiked,
      topImageUrl: this._topImageUrlResolver.resolve(member.topImagePath),
    }));
  }
}
