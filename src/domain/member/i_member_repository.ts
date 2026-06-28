import { UUID } from '../shared/vo/uuid'
import { Member } from './member'
import { Email } from '../shared/vo/email'

export interface IMemberRepository {
  findAll(): Promise<Member[]>
  findById(id: UUID): Promise<Member | null>
  findByEmail(email: Email): Promise<Member | null>
  create(member: Member, passwordHash: string, tx?: unknown): Promise<void>
}
