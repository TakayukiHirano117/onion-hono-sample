export type LikedMemberRow = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly hasLiked: boolean;
  readonly topImagePath: string | null;
};
