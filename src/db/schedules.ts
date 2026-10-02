import "server-only";
import { desc } from "drizzle-orm";
import { schedules } from "../../drizzle/schema";
import { db } from "@/db";
import { Schedule, ScheduleFormValues } from "@/types/schedule";

export async function getSchedules(): Promise<Schedule[]> {
  const rows = await db.select().from(schedules).orderBy(desc(schedules.createdAt));
  return rows.map((row) => ({
    ...row,
    // Postgres returns time as "HH:mm:ss"; the app uses "HH:mm".
    startTime: row.startTime.slice(0, 5),
    endTime: row.endTime.slice(0, 5),
    createdAt: row.createdAt.getTime(),
  }));
}

export async function insertSchedule(values: ScheduleFormValues) {
  await db.insert(schedules).values(values);
}
