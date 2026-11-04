import { and, eq, lte, sql } from "drizzle-orm";
import { db } from "../client";
import { recurringRulesTable, NewRecurringRule, RecurringRule } from "../schema";

type RulePatch = Partial<Omit<NewRecurringRule, "id" | "userId" | "createdAt">>;

export function getRulesDueWithin(userId: string, days: number) {
  // cutoff: today + days, formatted as ISO date
  const cutoff = sql`date('now', '+' || ${days} || ' days')`;
  return db
    .select()
    .from(recurringRulesTable)
    .where(
      and(
        eq(recurringRulesTable.userId, userId),
        eq(recurringRulesTable.isActive, true),
        lte(recurringRulesTable.nextDueDate, cutoff)
      )
    );
}

export function insertRecurringRule(data: NewRecurringRule) {
  return db.insert(recurringRulesTable).values(data).returning();
}

export function updateRecurringRule(id: string, patch: RulePatch) {
  return db
    .update(recurringRulesTable)
    .set(patch)
    .where(eq(recurringRulesTable.id, id))
    .returning();
}

export function deactivateRule(id: string) {
  return db
    .update(recurringRulesTable)
    .set({ isActive: false })
    .where(eq(recurringRulesTable.id, id));
}

/**
 * Advance nextDueDate by one frequency interval.
 * For 'monthly', snaps to last day of the target month when the source day
 * exceeds that month's length (e.g. Jan 31 → Feb 28).
 */
export async function advanceNextDueDate(id: string): Promise<void> {
  const [rule] = await db
    .select({
      nextDueDate: recurringRulesTable.nextDueDate,
      frequency: recurringRulesTable.frequency,
    })
    .from(recurringRulesTable)
    .where(eq(recurringRulesTable.id, id));

  if (!rule) return;

  const next = computeNextDate(rule.nextDueDate, rule.frequency);
  await db
    .update(recurringRulesTable)
    .set({ nextDueDate: next, updatedAt: new Date().toISOString() })
    .where(eq(recurringRulesTable.id, id));
}

function computeNextDate(
  current: string,
  frequency: RecurringRule["frequency"]
): string {
  const d = new Date(current);
  switch (frequency) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "monthly": {
      const originalDay = d.getDate();
      d.setDate(1); // avoid overshooting short months during month increment
      d.setMonth(d.getMonth() + 1);
      // snap to last day of month if original day exceeds it
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(originalDay, lastDay));
      break;
    }
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
