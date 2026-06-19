import { describe, it, expect } from 'vitest'
import { Name } from './name'

describe('Name', () => {
  it('正しい名前でインスタンス化できる', () => {
    const name = new Name('test')
    expect(name).toBeInstanceOf(Name)
  })

  it('名前の長さが最小文字数未満の場合にエラーが発生する', () => {
    expect(() => new Name('')).toThrow('名前の長さが不正です。(最小2文字)')
  })

  it('名前の長さが最大文字数を超えている場合にエラーが発生する', () => {
    expect(() => new Name('a'.repeat(Name.MAX_NAME_LENGTH + 1))).toThrow('名前の長さが不正です。(最大50文字)')
  })
})