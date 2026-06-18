import { UUID } from '../shared/vo/uuid'
import { Member } from './member'

export interface IMemberRepository {
  findAll(): Promise<Member[]>
  findById(id: UUID): Promise<Member | null>
}