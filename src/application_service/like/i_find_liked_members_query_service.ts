import type { LikedMemberRow } from "./liked_member_row";

export interface IFindLikedMembersQueryService {
  execute(viewerMemberId: string): Promise<LikedMemberRow[]>;
}
