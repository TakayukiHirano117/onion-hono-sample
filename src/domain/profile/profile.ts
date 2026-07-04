import { UUID } from "../shared/vo/uuid";
import { BirthDate } from "./vo/birth_date";
import { Gender } from "./vo/gender";
import { Bio } from "./vo/bio";
import { TopImagePath } from "./vo/top_image_path";

export class Profile {
  constructor(
    private readonly _memberId: UUID,
    private readonly _bio: Bio,
    private readonly _gender: Gender,
    private readonly _birthDate: BirthDate,
    private readonly _topImagePath: TopImagePath | null,
  ) {}

  static create(
    memberId: UUID,
    bio: Bio,
    gender: Gender,
    birthDate: BirthDate,
  ): Profile {
    return new Profile(memberId, bio, gender, birthDate, null);
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

  get topImagePath(): TopImagePath | null {
    return this._topImagePath;
  }
}
