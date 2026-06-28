import { Like } from "../like/like";

export interface IMatchingDomainService {
  isMatched(sentLike: Like, receivedLike: Like | null): boolean;
}
