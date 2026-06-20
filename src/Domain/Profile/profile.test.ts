import { describe, it, expect } from 'vitest'
import { Profile } from './profile'
import { UUID } from '../shared/vo/uuid'
import { Bio } from './vo/bio'
import { Gender } from './vo/gender'
import { BirthDate } from './vo/birth_date'

describe('Profile', () => {
  it('正しいプロフィールでインスタンス化できる', () => {
    const profile = new Profile(
      new UUID('123e4567-e89b-12d3-a456-426614174000'),
      new Bio('自己紹介'),
      new Gender('male'),
      new BirthDate('1990-01-01'),
    )
    expect(profile).toBeInstanceOf(Profile)
  })

  it('不正なプロフィールでエラーが発生する', () => {
    expect(() => new Profile(
      new UUID('123e4567-e89b-12d3-a456-426614174000'),
      new Bio('自己紹介'),
      new Gender('male'),
      new BirthDate('1990-01-01'),
    )).toThrow('プロフィールの形式が不正です。')
  })
})