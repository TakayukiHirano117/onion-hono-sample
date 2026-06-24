import { describe, it, expect } from 'vitest'
import { ValidationError } from '../exception/domain_error'
import { UUID } from './uuid'

describe('UUID', () => {
  it('正しいUUIDでインスタンス化できる', () => {
    const uuid = new UUID('123e4567-e89b-12d3-a456-426614174000')
    expect(uuid).toBeInstanceOf(UUID)
  })

  it('不正なUUIDでエラーが発生する', () => {
    expect(() => new UUID('invalid-uuid')).toThrow(ValidationError)
  })
})