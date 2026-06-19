import { describe, it, expect } from 'vitest'
import { Email } from './email'

describe('Email', () => {
  it('正しいメールアドレスでインスタンス化できる', () => {
    const email = new Email('test@example.com')
    expect(email).toBeInstanceOf(Email)
  })

  it('不正なメールアドレスでエラーが発生する', () => {
    expect(() => new Email('invalid-email')).toThrow('メールアドレスの形式が不正です。')
  })
})