import { IMemberRepository } from "../../Domain/Member/i_member_repository";
import { Member } from "../../Domain/Member/member";
import { Email } from "../../Domain/shared/vo/email";
import { UUID } from "../../Domain/shared/vo/uuid";
import { Name } from "../../Domain/Member/vo/name";
import { db } from "../Database/database";
import { resolveExecutor } from "../Database/executor";
import type { MemberRow } from "../Database/types";
import type { Kysely } from "kysely";
import type { Database } from "../Database/types";

export class MemberRepositoryImpl implements IMemberRepository {
  constructor(private readonly _db: Kysely<Database> = db) {}

  async findAll(): Promise<Member[]> {
    const rows = await this._db.selectFrom("members").selectAll().execute();

    return rows.map((row) => this.toMember(row));
  }

  async findById(id: UUID): Promise<Member | null> {
    const row = await this._db
      .selectFrom("members")
      .selectAll()
      .where("id", "=", id.value)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return this.toMember(row);
  }

  async create(member: Member, tx?: unknown): Promise<void> {
    const executor = resolveExecutor(this._db, tx);

    await executor
      .insertInto("members")
      .values({
        id: member.id.value,
        name: member.name.value,
        email: member.email.value,
      })
      .execute();
  }

  private toMember(row: MemberRow): Member {
    return new Member(
      new UUID(row.id),
      new Name(row.name),
      new Email(row.email),
    );
  }
}
