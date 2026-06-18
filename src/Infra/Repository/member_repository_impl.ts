import { IMemberRepository } from '../../Domain/Member/i_member_repository'
import { Member } from '../../Domain/Member/member'
import { UUID } from '../../Domain/shared/vo/uuid'

export class MemberRepositoryImpl implements IMemberRepository {
  // インメモリでいい
  constructor(private readonly _db: any) {}

  async findAll(): Promise<Member[]> {
    return this._db.findAll()
  }

  async findById(id: UUID): Promise<Member | null> {
    return this._db.findById(id)
  }
}