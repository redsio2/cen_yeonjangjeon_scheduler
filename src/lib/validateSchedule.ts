import { SCHEDULE_TYPES, ScheduleFormValues } from "@/types/schedule";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

/** Returns a user-facing error message, or null if the values are valid. */
export function validateSchedule(values: ScheduleFormValues): string | null {
  if (
    !values.title.trim() ||
    !values.date ||
    !values.startTime ||
    !values.endTime ||
    !values.assignee.trim() ||
    !values.location.trim()
  ) {
    return "모든 항목을 입력해주세요.";
  }

  if (
    !DATE_PATTERN.test(values.date) ||
    !TIME_PATTERN.test(values.startTime) ||
    !TIME_PATTERN.test(values.endTime) ||
    !SCHEDULE_TYPES.includes(values.type)
  ) {
    return "입력 형식이 올바르지 않습니다.";
  }

  if (values.startTime >= values.endTime) {
    return "종료 시간은 시작 시간보다 늦어야 합니다.";
  }

  return null;
}
