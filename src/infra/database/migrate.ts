import path from "path";
import { promises as fs } from "fs";
import { FileMigrationProvider, Migrator } from "kysely/migration";
import { createDbFromDatabaseUrl } from "./database";

async function migrateToLatest() {
  const db = createDbFromDatabaseUrl();
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(import.meta.dir, "migrations"),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((result) => {
    if (result.status === "Success") {
      console.log(`migration "${result.migrationName}" was executed successfully`);
    } else if (result.status === "Error") {
      console.error(`failed to execute migration "${result.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
