export class Email {
  private readonly _value: string

  constructor(value: string) {
    this.validate(value)

    this._value = value
  }

  private validate(value: string): void {
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
      throw new Error('メールアドレスの形式が不正です。')
    }
  }

  get value(): string {
    return this._value
  }
}