import { BaseValueObject } from "./base_value_object"

type EmailValue = string
export class Email extends BaseValueObject<EmailValue> {
  constructor(value: EmailValue) {
    super(value)
  }

  protected validate(value: EmailValue): void {
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
      throw new Error('メールアドレスの形式が不正です。')
    }
  }
}