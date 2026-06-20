import { describe, it, expect, beforeEach } from 'vitest'
import { Member } from './member'
import { UUIDGenerator } from '../../Infra/shared/uuid_generator'
import { UUID } from '../shared/vo/uuid'
import { Name } from './vo/name'
import { Email } from '../shared/vo/email'

describe('Member', () => {
  let member: Member
  let uuid: UUID
  let name: Name
  let email: Email

  beforeEach(() => {
    uuid = new UUID(UUIDGenerator.generate())
    name = new Name('test')
    email = new Email('test@example.com')

    member = Member.create(uuid, name, email)
  })

  it('正しいプロパティでインスタンス化できる', () => {

    expect(member).toBeInstanceOf(Member)
    expect(member.id).toBe(uuid)
    expect(member.name).toBe(name)
    expect(member.email).toBe(email)
  })

  it('今月送信できるいいね数の上限に達している場合にエラーが発生する', () => {
    expect(member.canSendLike(Member.MAX_MONTHLY_LIKE_COUNT)).toBe(false)
  })

  it('今月送信できるいいね数の上限に達していない場合にエラーが発生しない', () => {
    expect(member.canSendLike(Member.MAX_MONTHLY_LIKE_COUNT - 1)).toBe(true)
  })
})