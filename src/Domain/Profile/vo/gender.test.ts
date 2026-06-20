import { describe, it, expect } from 'vitest'
import { Gender } from './gender'

describe('Genger', () => {
  it('正しい性別でインスタンス化できる', () => {
    const gender = new Gender('male')
    expect(gender).toBeInstanceOf(Gender)
  })

  it('不正な性別でエラーが発生する', () => {
    expect(() => new Gender('invalid')).toThrow('性別の値が不正です。')
  })
})