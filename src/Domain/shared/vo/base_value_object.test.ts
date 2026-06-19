import { BaseValueObject } from "./base_value_object"
import { describe, it, expect } from 'vitest'

class TestValueObject extends BaseValueObject<string> {
  constructor(value: string) {
    super(value)
  }

  protected validate(value: string): void {
    if (value !== 'test') {
      throw new Error('value is not test')
    }
  }
}

describe('BaseValueObject', () => {
  it('インスタンス化できる', () => {
    const baseValueObject = new TestValueObject('test')
    expect(baseValueObject).toBeInstanceOf(TestValueObject)
  })

  it('不正な値でエラーが発生する', () => {
    expect(() => new TestValueObject('invalid')).toThrow('value is not test')
  })
})