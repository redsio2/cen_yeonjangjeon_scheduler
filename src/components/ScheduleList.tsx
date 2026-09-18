import { Schedule, ScheduleType } from "@/types/schedule";

const TYPE_BADGE_STYLE: Record<ScheduleType, string> = {
  촬영: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  편집: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  미팅: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  납품: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return `${year}년 ${month}월 ${day}일 (${WEEKDAYS[d.getDay()]})`;
}

interface ScheduleListProps {
  schedules: Schedule[];
}

export default function ScheduleList({ schedules }: ScheduleListProps) {
  if (schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/50 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          등록된 일정이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {schedules.map((schedule) => (
        <li
          key={schedule.id}
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${TYPE_BADGE_STYLE[schedule.type]}`}
              >
                {schedule.type}
              </span>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {schedule.title}
              </h3>
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {formatDate(schedule.date)} · {schedule.startTime} - {schedule.endTime}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span>담당자: {schedule.assignee}</span>
            <span>장소: {schedule.location}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
