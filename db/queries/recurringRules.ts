import { db } from "../index";
import { recurringRulesTable, type NewRecurringRule } from "../schema";
import { enqueueSync } from "./syncQueue";

export async function insertRecurringRule(values: NewRecurringRule) {
  await db.insert(recurringRulesTable).values(values);
  await enqueueSync("insert", "recurring_rules", values.id, values);
}
