import { eq } from "drizzle-orm";
import { db } from "../index";
import { profilesTable, type NewProfile } from "../schema";
import { enqueueSync } from "./syncQueue";

export async function insertProfile(values: NewProfile) {
  await db.insert(profilesTable).values(values);
  await enqueueSync("insert", "profiles", values.userId, values);
}

export async function upsertProfile(values: NewProfile) {
  await db
    .insert(profilesTable)
    .values(values)
    .onConflictDoUpdate({ target: profilesTable.userId, set: values });
  await enqueueSync("update", "profiles", values.userId, values);
}

export async function getProfile(userId: string) {
  const [row] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
  return row ?? null;
}
