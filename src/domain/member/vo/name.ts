import { ValidationError } from "../../shared/exception/domain_error"
import { BaseValueObject } from "../../shared/vo/base_value_object"

type NameValue = string
export class Name extends BaseValueObject<NameValue> {
  static readonly MIN_NAME_LENGTH = 2
  static readonly MAX_NAME_LENGTH = 50

  constructor(value: NameValue) {
    super(value)
  }

  protected validate(value: NameValue): void {
    if (value.length < Name.MIN_NAME_LENGTH) {
      throw new ValidationError(`名前の長さが不正です。(最小${Name.MIN_NAME_LENGTH}文字)`)
    }

    if (value.length > Name.MAX_NAME_LENGTH) {
      throw new ValidationError(`名前の長さが不正です。(最大${Name.MAX_NAME_LENGTH}文字)`)
    }
  }
}