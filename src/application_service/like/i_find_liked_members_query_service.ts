export type LikedMemberQueryResult = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly hasLiked: boolean;
  readonly topImagePath: string | null;
};

export interface IFindLikedMembersQueryService {
  execute(viewerMemberId: string): Promise<LikedMemberQueryResult[]>;
}
