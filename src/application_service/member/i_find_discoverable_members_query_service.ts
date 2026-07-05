import type { DiscoverableMemberRow } from "./discoverable_member_row";

export interface IFindDiscoverableMembersQueryService {
  execute(input: {
    viewerMemberId: string;
    genders: string[] | null;
  }): Promise<DiscoverableMemberRow[]>;
}
