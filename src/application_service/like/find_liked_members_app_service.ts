import { TopImagePath } from "../../domain/profile/vo/top_image_path";
import type { ITopImageUrlResolver } from "../shared/i_top_image_url_resolver";
import { FindLikedMembersAppServiceDto } from "./find_liked_members_app_service_dto";
import { IFindLikedMembersQueryService } from "./i_find_liked_members_query_service";

export class FindLikedMembersAppService {
  constructor(
    private readonly _findLikedMembersQueryService: IFindLikedMembersQueryService,
    private readonly _topImageUrlResolver: ITopImageUrlResolver,
  ) {}

  async execute(viewerMemberId: string): Promise<FindLikedMembersAppServiceDto[]> {
    const rows = await this._findLikedMembersQueryService.execute(viewerMemberId);

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
