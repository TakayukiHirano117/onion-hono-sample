import { UUID } from "../shared/vo/uuid";
import { BirthDate } from "./vo/birth_date";
import { Gender } from "./vo/gender";

export class Profile {
  constructor(
    private readonly _memberId: UUID,
    private readonly _bio: string | null,
    private readonly _gender: Gender | null,
    private readonly _birthDate: BirthDate | null,
  ) {}

  static createEmpty(memberId: UUID): Profile {
    return new Profile(memberId, null, null, null);
  }

  get memberId(): UUID {
    return this._memberId;
  }

  get bio(): string | null {
    return this._bio;
  }

  get gender(): Gender | null {
    return this._gender;
  }

  get birthDate(): BirthDate | null {
    return this._birthDate;
  }
}
