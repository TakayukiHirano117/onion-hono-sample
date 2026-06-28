import { describe, it, expect } from 'vitest'
import { ValidationError } from '../../shared/exception/domain_error'
import { Gender } from './gender'

describe('Genger', () => {
  it('正しい性別でインスタンス化できる', () => {
    const gender = new Gender('male')
    expect(gender).toBeInstanceOf(Gender)
  })

  it('不正な性別でエラーが発生する', () => {
    expect(() => new Gender('invalid')).toThrow(ValidationError)
  })
})