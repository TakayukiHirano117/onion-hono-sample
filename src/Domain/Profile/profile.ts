import { UUID } from "../shared/vo/uuid";
import { BirthDate } from "./vo/birth_date";
import { Gender } from "./vo/gender";

export class Profile {
  constructor(
    private readonly _memberId: UUID,
    private readonly _bio: string,
    private readonly _gender: Gender,
    private readonly _birthDate: BirthDate,
  ) {}

  static createEmpty(memberId: UUID): Profile {
    return new Profile(
      memberId,
      "",
      new Gender(Gender.OTHER),
      new BirthDate("1900-01-01"),
    );
  }

  get memberId(): UUID {
    return this._memberId;
  }

  get bio(): string {
    return this._bio;
  }

  get gender(): Gender {
    return this._gender;
  }

  get birthDate(): BirthDate {
    return this._birthDate;
  }
}
