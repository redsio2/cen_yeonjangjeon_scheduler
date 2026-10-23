export const SCHEDULE_TYPES = ["촬영", "편집", "미팅", "납품"] as const;

export type ScheduleType = (typeof SCHEDULE_TYPES)[number];

export const MEMO_MAX_LENGTH = 1000;
export const MEMO_LIMIT_PER_SCHEDULE = 100;

/** Result of a Server Action: a user-facing error message, or null on success. */
export type ActionResult = { error: string | null };

export interface ScheduleMemo {
  id: string;
  scheduleId: string;
  content: string;
  createdAt: number;
}

export interface Schedule {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: ScheduleType;
  assignee: string;
  location: string;
  createdAt: number;
  memos: ScheduleMemo[]; // oldest first
}

export type ScheduleFormValues = Omit<Schedule, "id" | "createdAt" | "memos">;
