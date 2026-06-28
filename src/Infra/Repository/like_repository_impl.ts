import { ILikeRepository } from "../../Domain/Like/i_like_repository";
import { Like } from "../../Domain/Like/like";
import { UUID } from "../../Domain/shared/vo/uuid";
import { resolveExecutor } from "../Database/executor";
import type { Database, LikeRow } from "../Database/types";
import type { Kysely } from "kysely";

export class LikeRepositoryImpl implements ILikeRepository {
  constructor(private readonly _db: Kysely<Database>) {}

  async create(like: Like, tx?: unknown): Promise<void> {
    const executor = resolveExecutor(this._db, tx);

    await executor
      .insertInto("likes")
      .values({
        id: like.id.value,
        from_member_id: like.fromMemberId.value,
        to_member_id: like.toMemberId.value,
      })
      .execute();
  }

  async exists(fromMemberId: UUID, toMemberId: UUID): Promise<boolean> {
    const row = await this._db
      .selectFrom("likes")
      .select("id")
      .where("from_member_id", "=", fromMemberId.value)
      .where("to_member_id", "=", toMemberId.value)
      .executeTakeFirst();

    return row !== undefined;
  }

  async findByMembers(fromMemberId: UUID, toMemberId: UUID, tx?: unknown): Promise<Like | null> {
    const executor = resolveExecutor(this._db, tx);
    const row = await executor
      .selectFrom("likes")
      .selectAll()
      .where("from_member_id", "=", fromMemberId.value)
      .where("to_member_id", "=", toMemberId.value)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return this.toLike(row);
  }

  async countSentThisMonth(fromMemberId: UUID): Promise<number> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const row = await this._db
      .selectFrom("likes")
      .select((eb) => eb.fn.countAll().as("count"))
      .where("from_member_id", "=", fromMemberId.value)
      .where("created_at", ">=", thisMonthStart)
      .where("created_at", "<", nextMonthStart)
      .executeTakeFirstOrThrow();

    return Number(row.count);
  }

  private toLike(row: LikeRow): Like {
    return new Like(new UUID(row.id), new UUID(row.from_member_id), new UUID(row.to_member_id));
  }
}
