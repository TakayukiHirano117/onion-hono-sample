import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("likes")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("from_member_id", "uuid", (col) => col.notNull())
    .addColumn("to_member_id", "uuid", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addForeignKeyConstraint(
      "likes_from_member_id_fk",
      ["from_member_id"],
      "members",
      ["id"],
      (cb) => cb.onDelete("cascade"),
    )
    .addForeignKeyConstraint(
      "likes_to_member_id_fk",
      ["to_member_id"],
      "members",
      ["id"],
      (cb) => cb.onDelete("cascade"),
    )
    .addUniqueConstraint("likes_from_member_id_to_member_id_unique", [
      "from_member_id",
      "to_member_id",
    ])
    .addCheckConstraint(
      "likes_not_self",
      sql`from_member_id <> to_member_id`,
    )
    .execute();

  await db.schema
    .createIndex("likes_from_member_id_idx")
    .on("likes")
    .column("from_member_id")
    .execute();

  await db.schema
    .createIndex("likes_to_member_id_idx")
    .on("likes")
    .column("to_member_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("likes").execute();
}
