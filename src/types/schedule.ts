export const SCHEDULE_TYPES = ["촬영", "편집", "미팅", "납품"] as const;

export type ScheduleType = (typeof SCHEDULE_TYPES)[number];

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
}

export type ScheduleFormValues = Omit<Schedule, "id" | "createdAt">;
