export class Gender {
  static readonly MALE = "male";
  static readonly FEMALE = "female";
  static readonly OTHER = "other";

  private static readonly ALLOWED = [
    Gender.MALE,
    Gender.FEMALE,
    Gender.OTHER,
  ] as const;

  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  private validate(value: string): void {
    if (!Gender.ALLOWED.includes(value as (typeof Gender.ALLOWED)[number])) {
      throw new Error("性別の値が不正です。");
    }
  }

  get value(): string {
    return this._value;
  }
}
