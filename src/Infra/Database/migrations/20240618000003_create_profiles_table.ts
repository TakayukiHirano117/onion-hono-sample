import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("profiles")
    .addColumn("member_id", "uuid", (col) => col.primaryKey())
    .addColumn("bio", "text")
    .addColumn("gender", "varchar")
    .addColumn("birth_date", "date")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addForeignKeyConstraint(
      "profiles_member_id_fk",
      ["member_id"],
      "members",
      ["id"],
      (cb) => cb.onDelete("cascade"),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("profiles").execute();
}
