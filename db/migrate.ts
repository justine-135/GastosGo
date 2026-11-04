import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "./client";
import migrations from "../drizzle/migrations";
import { seedDefaultCategories } from "./seed";

/**
 * Run migrations then seed. Call this before first render (e.g. in useMigrations
 * wrapper or a useEffect gate). Throws on failure — do not silence.
 */
export async function runMigrations(): Promise<void> {
  await migrate(db, migrations);
  await seedDefaultCategories();
}
