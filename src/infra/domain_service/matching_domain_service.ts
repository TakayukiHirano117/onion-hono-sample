import type { Like } from "../../domain/like/like";
import type { IMatchingDomainService } from "../../domain/matching/i_matching_domain_service";

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
