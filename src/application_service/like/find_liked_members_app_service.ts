import { FindLikedMembersAppServiceDto } from "./find_liked_members_app_service_dto";
import { IFindLikedMembersQueryService } from "./i_find_liked_members_query_service";

export class FindLikedMembersAppService {
  constructor(private readonly _findLikedMembersQueryService: IFindLikedMembersQueryService) {}

  async execute(viewerMemberId: string): Promise<FindLikedMembersAppServiceDto[]> {
    return this._findLikedMembersQueryService.execute(viewerMemberId);
  }
}
