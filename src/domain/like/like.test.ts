import { describe, it, expect } from 'vitest'
import { DomainError } from '../shared/exception/domain_error'
import { UUID } from '../shared/vo/uuid'
import { Like } from './like'

describe('Like', () => {
  it('正しいプロパティでインスタンス化できる', () => {
    const id = new UUID('123e4567-e89b-12d3-a456-426614174002')
    const fromMemberId = new UUID('123e4567-e89b-12d3-a456-426614174000')
    const toMemberId = new UUID('123e4567-e89b-12d3-a456-426614174001')
    const like = Like.create(id, fromMemberId, toMemberId)

    expect(like).toBeInstanceOf(Like)
    expect(like.id).toBe(id)
    expect(like.fromMemberId).toBe(fromMemberId)
    expect(like.toMemberId).toBe(toMemberId)
  })

  it('自分自身にはいいねできない', () => {
    const id = new UUID('123e4567-e89b-12d3-a456-426614174002')
    const fromMemberId = new UUID('123e4567-e89b-12d3-a456-426614174000')
    const toMemberId = new UUID('123e4567-e89b-12d3-a456-426614174000')
    expect(() => Like.create(id, fromMemberId, toMemberId)).toThrow(DomainError)
  })
})