import { UUID } from "../shared/vo/uuid";
import { BirthDate } from "./vo/birth_date";
import { Gender } from "./vo/gender";
import { Bio } from "./vo/bio";

export class Profile {
  // privateにしてDBからのインスタンス化用と新規作成用で変えてもいい
  constructor(
    private readonly _memberId: UUID,
    private readonly _bio: Bio,
    private readonly _gender: Gender,
    private readonly _birthDate: BirthDate,
  ) { }

  static create(
    memberId: UUID,
    bio: Bio,
    gender: Gender,
    birthDate: BirthDate
  ): Profile {
    return new Profile(memberId, bio, gender, birthDate);
  }

  get memberId(): UUID {
    return this._memberId;
  }

  get bio(): Bio {
    return this._bio;
  }

  get gender(): Gender {
    return this._gender;
  }

  get birthDate(): BirthDate {
    return this._birthDate;
  }
}
