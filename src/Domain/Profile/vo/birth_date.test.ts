import { describe, it, expect } from 'vitest'
import { ValidationError } from '../../shared/exception/domain_error'
import { BirthDate } from './birth_date'

describe('BirthDate', () => {
  it('正しい生年月日でインスタンス化できる', () => {
    const birthDate = new BirthDate('1990/01/01')
    expect(birthDate).toBeInstanceOf(BirthDate)
  })

  it('不正な生年月日でエラーが発生する', () => {
    expect(() => new BirthDate('invalid-birth-date')).toThrow(ValidationError)
  })
})