import { TopImagePath } from "../../domain/profile/vo/top_image_path";
import type { ITopImageUrlResolver } from "../shared/i_top_image_url_resolver";
import { IFindLikedMembersQueryService } from "./i_find_liked_members_query_service";

export type FindLikedMembersAppServiceDto = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly hasLiked: boolean;
  readonly topImageUrl: string | null;
};

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
