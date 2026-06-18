import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("profiles")
    .addColumn("gender", "varchar")
    .addColumn("birth_date", "date")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("profiles")
    .dropColumn("gender")
    .dropColumn("birth_date")
    .execute();
}
