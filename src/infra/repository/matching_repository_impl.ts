import type { IMatchingRepository } from "../../domain/matching/i_matching_repository";
import { Matching } from "../../domain/matching/matching";
import { resolveExecutor } from "../database/executor";
import type { Database } from "../database/types";
import type { Kysely } from "kysely";

export class MatchingRepositoryImpl implements IMatchingRepository {
  constructor(private readonly _db: Kysely<Database>) {}

  async create(matching: Matching, tx?: unknown): Promise<void> {
    const executor = resolveExecutor(this._db, tx);

    await executor
      .insertInto("matches")
      .values({
        id: matching.id.value,
        member1_id: matching.member1Id.value,
        member2_id: matching.member2Id.value,
      })
      .onConflict((oc) => oc.columns(["member1_id", "member2_id"]).doNothing())
      .execute();
  }
}
