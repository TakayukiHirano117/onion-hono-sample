import { InvariantViolationError } from "../shared/exception/domain_error";
import { UUID } from "../shared/vo/uuid";

export class Like {
  private constructor(
    private readonly _id: UUID,
    private readonly _fromMemberId: UUID,
    private readonly _toMemberId: UUID,
  ) {}

  static reconstruct(id: UUID, fromMemberId: UUID, toMemberId: UUID): Like {
    return new Like(id, fromMemberId, toMemberId);
  }

  static create(id: UUID, fromMemberId: UUID, toMemberId: UUID): Like {
    if (fromMemberId.value === toMemberId.value) {
      throw new InvariantViolationError("自分自身にはいいねできません。");
    }

    return new Like(id, fromMemberId, toMemberId);
  }

  get id(): UUID {
    return this._id;
  }

  get fromMemberId(): UUID {
    return this._fromMemberId;
  }

  get toMemberId(): UUID {
    return this._toMemberId;
  }
}
