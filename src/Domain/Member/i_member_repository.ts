import { UUID } from '../shared/vo/uuid'
import { Member } from './member'
import { Transaction } from 'kysely'
import { Database } from '../../Infra/Database/types'

export interface IMemberRepository {
  findAll(): Promise<Member[]>
  findById(id: UUID): Promise<Member | null>
  create(member: Member, tx?: Transaction<Database>): Promise<void>
}
