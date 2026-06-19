import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("matches")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("member1_id", "uuid", (col) => col.notNull())
    .addColumn("member2_id", "uuid", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addForeignKeyConstraint(
      "matches_member1_id_fk",
      ["member1_id"],
      "members",
      ["id"],
      (cb) => cb.onDelete("cascade"),
    )
    .addForeignKeyConstraint(
      "matches_member2_id_fk",
      ["member2_id"],
      "members",
      ["id"],
      (cb) => cb.onDelete("cascade"),
    )
    .addUniqueConstraint("matches_member1_id_member2_id_unique", [
      "member1_id",
      "member2_id",
    ])
    .addCheckConstraint(
      "matches_member_order",
      sql`member1_id < member2_id`,
    )
    .execute();

  await db.schema
    .createIndex("matches_member1_id_idx")
    .on("matches")
    .column("member1_id")
    .execute();

  await db.schema
    .createIndex("matches_member2_id_idx")
    .on("matches")
    .column("member2_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("matches").execute();
}
