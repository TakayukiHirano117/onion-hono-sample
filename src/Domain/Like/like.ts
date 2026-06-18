import { UUID } from "../shared/vo/uuid"

export class Like {
  constructor(
    private readonly _id: UUID,
    private readonly _fromMemberId: UUID,
    private readonly _toMemberId: UUID,
  ) {}

  get id(): UUID {
    return this._id
  }

  get fromMemberId(): UUID {
    return this._fromMemberId
  }

  get toMemberId(): UUID {
    return this._toMemberId
  }
}