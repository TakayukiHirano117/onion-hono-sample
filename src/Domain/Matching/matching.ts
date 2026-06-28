import { InvariantViolationError } from "../shared/exception/domain_error";
import { UUID } from "../shared/vo/uuid";

export class Matching {
  private constructor(
    private readonly _id: UUID,
    private readonly _member1Id: UUID,
    private readonly _member2Id: UUID,
  ) {
    if (_member1Id.value === _member2Id.value) {
      throw new InvariantViolationError("同じ会員同士はマッチングできません。");
    }
  }

  static create(id: UUID, memberId: UUID, otherMemberId: UUID): Matching {
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
