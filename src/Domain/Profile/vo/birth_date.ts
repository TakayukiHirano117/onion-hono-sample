export class BirthDate {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  private validate(value: string): void {
    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(value)) {
      throw new Error("生年月日の形式が不正です。");
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error("生年月日の形式が不正です。");
    }

    if (date > new Date()) {
      throw new Error("生年月日は未来の日付にできません。");
    }
  }

  get value(): string {
    return this._value;
  }
}
