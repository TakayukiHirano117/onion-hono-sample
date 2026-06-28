import { IProfileRepository } from "../../Domain/Profile/i_profile_repository";
import { Profile } from "../../Domain/Profile/profile";
import { resolveExecutor } from "../Database/executor";
import type { Kysely } from "kysely";
import type { Database } from "../Database/types";

export class ProfileRepositoryImpl implements IProfileRepository {
  constructor(private readonly _db: Kysely<Database>) {}

  async create(profile: Profile, tx?: unknown): Promise<void> {
    const executor = resolveExecutor(this._db, tx);

    await executor
      .insertInto("profiles")
      .values({
        member_id: profile.memberId.value,
        bio: profile.bio.value,
        gender: profile.gender.value,
        birth_date: profile.birthDate.value,
      })
      .execute();
  }
}
