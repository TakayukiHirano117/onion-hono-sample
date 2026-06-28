import { describe, expect, it } from "vitest";
import { InvariantViolationError } from "../shared/exception/domain_error";
import { UUID } from "../shared/vo/uuid";
import { Matching } from "./matching";

const matchingId = new UUID("00000000-0000-4000-8000-000000000001");
const smallerMemberId = new UUID("00000000-0000-4000-8000-000000000002");
const largerMemberId = new UUID("00000000-0000-4000-8000-000000000003");

describe("Matching", () => {
  it("member1Id と member2Id を昇順に並べて作成する", () => {
    const matching = Matching.create(matchingId, largerMemberId, smallerMemberId);

    expect(matching.member1Id).toBe(smallerMemberId);
    expect(matching.member2Id).toBe(largerMemberId);
  });

  it("同じ会員同士では作成できない", () => {
    expect(() => Matching.create(matchingId, smallerMemberId, smallerMemberId)).toThrow(
      InvariantViolationError,
    );
  });
});
