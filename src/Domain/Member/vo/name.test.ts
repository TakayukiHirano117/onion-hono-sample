import { describe, it, expect } from 'vitest'
import { ValidationError } from '../../shared/exception/domain_error'
import { Name } from './name'

describe('Name', () => {
  it('正しい名前でインスタンス化できる', () => {
    const name = new Name('test')
    expect(name).toBeInstanceOf(Name)
  })

  it('名前の長さが最小文字数未満の場合にエラーが発生する', () => {
    expect(() => new Name('')).toThrow(ValidationError)
  })

  it('名前の長さが最大文字数を超えている場合にエラーが発生する', () => {
    expect(() => new Name('a'.repeat(Name.MAX_NAME_LENGTH + 1))).toThrow(ValidationError)
  })
})