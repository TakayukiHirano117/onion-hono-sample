import { Like } from "../Like/like";

export interface IMatchingDomainService {
  isMatched(sentLike: Like, receivedLike: Like | null): boolean;
}
