export type DiscoverableMemberQueryResult = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly hasLiked: boolean;
  readonly topImagePath: string | null;
};

export interface IFindDiscoverableMembersQueryService {
  execute(input: {
    viewerMemberId: string;
    genders: string[] | null;
  }): Promise<DiscoverableMemberQueryResult[]>;
}
