import { db } from "./client";
import { categoriesTable } from "./schema";

const DEFAULT_CATEGORIES = [
  { id: "cat_food",          name: "Food",          icon: "🍔", color: "#FFD6A5" },
  { id: "cat_transport",     name: "Transport",     icon: "🚌", color: "#CAFFBF" },
  { id: "cat_shopping",      name: "Shopping",      icon: "🛍️", color: "#BDE0FE" },
  { id: "cat_bills",         name: "Bills",         icon: "🧾", color: "#FDFFB6" },
  { id: "cat_entertainment", name: "Entertainment", icon: "🎬", color: "#FFC6FF" },
  { id: "cat_health",        name: "Health",        icon: "💊", color: "#A0C4FF" },
  { id: "cat_savings",       name: "Savings",       icon: "🏦", color: "#9BF6FF" },
  { id: "cat_others",        name: "Others",        icon: "📦", color: "#FFFFFC" },
] as const;

/**
 * Idempotent: skips categories whose id already exists (global defaults, userId null).
 */
export async function seedDefaultCategories(): Promise<void> {
  for (const cat of DEFAULT_CATEGORIES) {
    await db
      .insert(categoriesTable)
      .values({ ...cat, userId: null, monthlyBudget: 0, currency: "PHP" })
      .onConflictDoNothing();
  }
}
