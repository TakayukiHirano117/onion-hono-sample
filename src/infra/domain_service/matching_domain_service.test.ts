import { describe, expect, it } from "vitest";
import { Like } from "../../domain/like/like";
import { UUID } from "../../domain/shared/vo/uuid";
import { MatchingDomainService } from "./matching_domain_service";

const likeId = new UUID("00000000-0000-4000-8000-000000000001");
const otherLikeId = new UUID("00000000-0000-4000-8000-000000000002");
const fromMemberId = new UUID("00000000-0000-4000-8000-000000000003");
const toMemberId = new UUID("00000000-0000-4000-8000-000000000004");

describe("MatchingDomainService", () => {
  const service = new MatchingDomainService();

  it("送信したいいねと逆向きのいいねがある場合にマッチング成立と判定する", () => {
    const sentLike = Like.create(likeId, fromMemberId, toMemberId);
    const receivedLike = Like.create(otherLikeId, toMemberId, fromMemberId);

    expect(service.isMatched(sentLike, receivedLike)).toBe(true);
  });

  it("逆向きのいいねがない場合はマッチング不成立と判定する", () => {
    const sentLike = Like.create(likeId, fromMemberId, toMemberId);

    expect(service.isMatched(sentLike, null)).toBe(false);
  });

  it("同じ向きのいいねの場合はマッチング不成立と判定する", () => {
    const sentLike = Like.create(likeId, fromMemberId, toMemberId);
    const sameDirectionLike = Like.create(otherLikeId, fromMemberId, toMemberId);

    expect(service.isMatched(sentLike, sameDirectionLike)).toBe(false);
  });
});
