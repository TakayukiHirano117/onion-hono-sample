import type { Like } from "../../Domain/Like/like";
import type { IMatchingDomainService } from "../../Domain/Matching/i_matching_domain_service";

export class MatchingDomainService implements IMatchingDomainService {
  isMatched(sentLike: Like, receivedLike: Like | null): boolean {
    if (!receivedLike) {
      return false;
    }

    return (
      sentLike.fromMemberId.value === receivedLike.toMemberId.value &&
      sentLike.toMemberId.value === receivedLike.fromMemberId.value
    );
  }
}
