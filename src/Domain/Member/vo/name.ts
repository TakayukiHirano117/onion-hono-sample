export class Name {
  private readonly _value: string

  static readonly MAX_NAME_LENGTH = 50
  static readonly MIN_NAME_LENGTH = 2

  constructor(value: string) {
    this.validate(value)

    this._value = value
  }

  private validate(value: string): void {
    if (value.length < Name.MIN_NAME_LENGTH || value.length > Name.MAX_NAME_LENGTH) {
      throw new Error(`名前の長さが不正です。(最小${Name.MIN_NAME_LENGTH}文字、最大${Name.MAX_NAME_LENGTH}文字)`)
    }
  }

  get value(): string {
    return this._value
  }
}