import { InvariantViolationError } from "../shared/exception/domain_error";
import { UUID } from "../shared/vo/uuid";

export class Matching {
  private constructor(
    private readonly _id: UUID,
    private readonly _member1Id: UUID,
    private readonly _member2Id: UUID,
  ) {}

  static reconstruct(id: UUID, member1Id: UUID, member2Id: UUID): Matching {
    return new Matching(id, member1Id, member2Id);
  }

  static create(id: UUID, memberId: UUID, otherMemberId: UUID): Matching {
    if (memberId.value === otherMemberId.value) {
      throw new InvariantViolationError("同じ会員同士はマッチングできません。");
    }

    const [member1Id, member2Id] =
      memberId.value < otherMemberId.value ? [memberId, otherMemberId] : [otherMemberId, memberId];

    return new Matching(id, member1Id, member2Id);
  }

  get id(): UUID {
    return this._id;
  }

  get member1Id(): UUID {
    return this._member1Id;
  }

  get member2Id(): UUID {
    return this._member2Id;
  }
}
