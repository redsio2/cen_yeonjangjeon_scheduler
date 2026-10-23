import "server-only";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { scheduleMemos } from "../../drizzle/schema";

const FOREIGN_KEY_VIOLATION = "23503";

export async function countMemos(scheduleId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(scheduleMemos)
    .where(eq(scheduleMemos.scheduleId, scheduleId));
  return row.value;
}

/** Returns false if the schedule no longer exists. */
export async function insertMemo(scheduleId: string, content: string): Promise<boolean> {
  try {
    await db.insert(scheduleMemos).values({ scheduleId, content });
    return true;
  } catch (e) {
    // Drizzle wraps the postgres-js error in DrizzleQueryError; the SQLSTATE code is on its cause.
    const code = (e as { cause?: { code?: string } })?.cause?.code;
    if (code === FOREIGN_KEY_VIOLATION) return false;
    throw e;
  }
}

export async function deleteMemoById(id: string) {
  await db.delete(scheduleMemos).where(eq(scheduleMemos.id, id));
}
