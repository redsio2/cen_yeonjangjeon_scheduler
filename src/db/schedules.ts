import "server-only";
import { db } from "@/db";
import { schedules } from "../../drizzle/schema";
import { Schedule, ScheduleFormValues } from "@/types/schedule";

export async function getSchedules(): Promise<Schedule[]> {
  const rows = await db.query.schedules.findMany({
    orderBy: (s, { desc }) => [desc(s.createdAt)],
    with: {
      memos: { orderBy: (m, { asc }) => [asc(m.createdAt)] },
    },
  });
  return rows.map((row) => ({
    ...row,
    // Postgres returns time as "HH:mm:ss"; the app uses "HH:mm".
    startTime: row.startTime.slice(0, 5),
    endTime: row.endTime.slice(0, 5),
    createdAt: row.createdAt.getTime(),
    memos: row.memos.map((memo) => ({ ...memo, createdAt: memo.createdAt.getTime() })),
  }));
}

export async function insertSchedule(values: ScheduleFormValues) {
  await db.insert(schedules).values(values);
}
