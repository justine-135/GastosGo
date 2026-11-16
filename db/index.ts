import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../drizzle/migrations";
import * as schema from "./schema";

const expoDb = openDatabaseSync("gastosgo.db", { enableChangeListener: true });
export const db = drizzle(expoDb, { schema });

export { useMigrations, migrations };

export const DEFAULT_CATEGORIES: Array<{
  name: string;
  icon: string;
  color: string;
  monthlyBudget: number;
}> = [
  { name: "Food", icon: "🍚", color: "#F4A261", monthlyBudget: 3000 },
  { name: "Transport", icon: "🚌", color: "#A8DADC", monthlyBudget: 1500 },
  { name: "Leisure", icon: "🎮", color: "#E9C46A", monthlyBudget: 2000 },
  { name: "Bills", icon: "📝", color: "#81B29A", monthlyBudget: 5000 },
  { name: "Shopping", icon: "🛍️", color: "#E76F51", monthlyBudget: 2000 },
  { name: "Health", icon: "💊", color: "#264653", monthlyBudget: 1000 },
  { name: "Other", icon: "📦", color: "#457B9D", monthlyBudget: 1000 },
];
