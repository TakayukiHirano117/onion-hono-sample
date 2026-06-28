import type { Kysely } from "kysely";
import type { Database } from "../types";
import { sql } from "kysely";

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("sessions")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("member_id", "uuid", (col) => col.notNull())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`),
    )
    .addForeignKeyConstraint("sessions_member_id_fk", ["member_id"], "members", ["id"], (cb) => cb.onDelete("cascade"))
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("sessions").execute();
}