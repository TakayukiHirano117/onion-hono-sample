import { FindAllMemberAppServiceDto } from "./find_all_member_app_service_dto";

export interface IFindDiscoverableMembersQueryService {
  execute(input: {
    viewerMemberId: string;
    genders: string[] | null;
  }): Promise<FindAllMemberAppServiceDto[]>;
}
