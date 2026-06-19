import { BaseValueObject } from "../../shared/vo/base_value_object"

type NameValue = string
export class Name extends BaseValueObject<NameValue> {
  static readonly MIN_NAME_LENGTH = 2

  constructor(value: NameValue) {
    super(value)
  }

  protected validate(value: NameValue): void {
    if (value.length < Name.MIN_NAME_LENGTH) {
      throw new Error(`名前の長さが不正です。(最小${Name.MIN_NAME_LENGTH}文字)`)
    }
  }
}