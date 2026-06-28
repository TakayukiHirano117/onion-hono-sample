import type { Kysely } from "kysely";
import type { Database } from "../types";

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema.alterTable("members").addColumn("password_hash", "varchar", (col) => col.notNull()).execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.alterTable("members").dropColumn("password_hash").execute();
}