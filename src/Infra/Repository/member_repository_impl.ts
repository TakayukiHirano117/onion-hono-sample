import { IMemberRepository } from '../../Domain/Member/i_member_repository'
import { Member } from '../../Domain/Member/member'
import { UUID } from '../../Domain/shared/vo/uuid'
import { Database } from '../Database/types'

export class MemberRepositoryImpl implements IMemberRepository {
  constructor(private readonly _db: Database) {}
  // DB呼び出す
  async findAll(): Promise<Member[]> {
    return this._db.findAll()
  }

  async findById(id: UUID): Promise<Member | null> {
    return this._db.findById(id)
  }
}