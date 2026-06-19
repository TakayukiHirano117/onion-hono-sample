import { UUID } from "../shared/vo/uuid";

export class Like {
  constructor(
    private readonly _id: UUID,
    private readonly _fromMemberId: UUID,
    private readonly _toMemberId: UUID,
  ) {
    if (_fromMemberId.value === _toMemberId.value) {
      throw new Error("自分自身にはいいねできません。");
    }
  }

  static create(id: UUID, fromMemberId: UUID, toMemberId: UUID): Like {
    return new Like(id, fromMemberId, toMemberId);
  }

  isMutualWith(other: Like): boolean {
    return (
      this._fromMemberId.value === other.toMemberId.value &&
      this._toMemberId.value === other.fromMemberId.value
    );
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