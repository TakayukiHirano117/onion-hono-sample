import { FindLikedMembersAppServiceDto } from "./find_liked_members_app_service_dto";

export interface IFindLikedMembersQueryService {
  execute(viewerMemberId: string): Promise<FindLikedMembersAppServiceDto[]>;
}
