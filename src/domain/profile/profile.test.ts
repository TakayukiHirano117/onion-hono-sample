import { describe, it, expect } from 'vitest'
import { Profile } from './profile'
import { UUID } from '../shared/vo/uuid'
import { Bio } from './vo/bio'
import { Gender } from './vo/gender'
import { BirthDate } from './vo/birth_date'

describe('Profile', () => {
  it('正しいプロフィールでインスタンス化できる', () => {
    const memberId = new UUID('123e4567-e89b-12d3-a456-426614174000')
    const bio = new Bio('自己紹介')
    const gender = new Gender('male')
    const birthDate = new BirthDate('1990/01/01')

    const profile = new Profile(
      memberId,
      bio,
      gender,
      birthDate,
    )

    expect(profile).toBeInstanceOf(Profile)
    expect(profile.memberId).toBe(memberId)
    expect(profile.bio).toBe(bio)
    expect(profile.gender).toBe(gender)
    expect(profile.birthDate).toBe(birthDate)
  })

  it('createでインスタンス化できる', () => {
    const memberId = new UUID('123e4567-e89b-12d3-a456-426614174000')
    const bio = new Bio('自己紹介')
    const gender = new Gender('male')
    const birthDate = new BirthDate('1990/01/01')

    const profile = Profile.create(memberId, bio, gender, birthDate)

    expect(profile).toBeInstanceOf(Profile)
  })
})
