export class UUID {
  private readonly _value: string

  constructor(value: string) {
    this.validate(value)

    this._value = value
  }

  private validate(value: string): void {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value)) {
      throw new Error('IDの形式が不正です。')
    }
  }

  get value(): string {
    return this._value
  }
}