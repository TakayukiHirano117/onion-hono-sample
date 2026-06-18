import { Profile } from "./profile";
import { Transaction } from 'kysely'
import { Database } from '../../Infra/Database/types'

export interface IProfileRepository {
  create(profile: Profile, tx?: Transaction<Database>): Promise<void>;
}
