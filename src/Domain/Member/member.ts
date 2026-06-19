import { UUID } from "../shared/vo/uuid";
import { Name } from "./vo/name";
import { Email } from "../shared/vo/email";

export class Member {
  static readonly MAX_MONTHLY_LIKE_COUNT = 100;

  constructor(
    private readonly _id: UUID,
    private readonly _name: Name,
    private readonly _email: Email,
  ) {}

  static create(id: UUID, name: string, email: string): Member {
    return new Member(id, new Name(name), new Email(email));
  }

  canSendLike(sentLikeCountThisMonth: number): boolean {
    return sentLikeCountThisMonth < Member.MAX_MONTHLY_LIKE_COUNT;
  }

  get id(): UUID {
    return this._id;
  }

  get name(): Name {
    return this._name;
  }

  get email(): Email {
    return this._email;
  }
}
