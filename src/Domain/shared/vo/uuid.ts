import { BaseValueObject } from "./base_value_object"

type UUIDValue = string
export class UUID extends BaseValueObject<UUIDValue> {
  constructor(value: UUIDValue) {
    super(value)
  }

  protected validate(value: UUIDValue): void {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value)) {
      throw new Error('IDの形式が不正です。')
    }
  }
}