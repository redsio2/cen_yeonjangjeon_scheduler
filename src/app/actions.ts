"use server";

import { refresh } from "next/cache";
import { after } from "next/server";
import { countMemos, deleteMemoById, insertMemo } from "@/db/memos";
import { insertSchedule } from "@/db/schedules";
import { emailScheduleCreated } from "@/lib/notifyEmail";
import { notifyScheduleCreated } from "@/lib/notifySlack";
import { worksScheduleCreated } from "@/lib/notifyWorks";
import { validateMemo } from "@/lib/validateMemo";
import { validateSchedule } from "@/lib/validateSchedule";
import { ActionResult, MEMO_LIMIT_PER_SCHEDULE, ScheduleFormValues } from "@/types/schedule";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function addSchedule(
  values: ScheduleFormValues
): Promise<ActionResult> {
  // Server Actions are public endpoints, so re-check everything the form checked.
  const normalized: ScheduleFormValues = {
    title: String(values?.title ?? "").trim(),
    date: String(values?.date ?? ""),
    startTime: String(values?.startTime ?? ""),
    endTime: String(values?.endTime ?? ""),
    type: values?.type,
    assignee: String(values?.assignee ?? "").trim(),
    location: String(values?.location ?? "").trim(),
  };

  const error = validateSchedule(normalized);
  if (error) return { error };

  try {
    await insertSchedule(normalized);
  } catch (e) {
    console.error("Failed to insert schedule", e);
    return { error: "일정 저장에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  // Send the notices after the response so they never slow down or fail the form.
  after(() =>
    Promise.all([
      notifyScheduleCreated(normalized),
      emailScheduleCreated(normalized),
      worksScheduleCreated(normalized),
    ])
  );
  refresh();
  return { error: null };
}

export async function addMemo(
  scheduleId: string,
  content: string
): Promise<ActionResult> {
  const id = String(scheduleId ?? "");
  const text = String(content ?? "").trim();

  if (!UUID_PATTERN.test(id)) return { error: "일정을 찾을 수 없습니다." };
  const error = validateMemo(text);
  if (error) return { error };

  try {
    if ((await countMemos(id)) >= MEMO_LIMIT_PER_SCHEDULE) {
      return { error: `메모는 일정당 최대 ${MEMO_LIMIT_PER_SCHEDULE}개까지 남길 수 있습니다.` };
    }
    if (!(await insertMemo(id, text))) {
      // The schedule was deleted after this page loaded; refresh so it disappears from the list.
      refresh();
      return { error: "일정을 찾을 수 없습니다." };
    }
  } catch (e) {
    console.error("Failed to insert memo", e);
    return { error: "메모 저장에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  refresh();
  return { error: null };
}

export async function deleteMemo(memoId: string): Promise<ActionResult> {
  const id = String(memoId ?? "");
  if (!UUID_PATTERN.test(id)) return { error: "메모를 찾을 수 없습니다." };

  try {
    await deleteMemoById(id);
  } catch (e) {
    console.error("Failed to delete memo", e);
    return { error: "메모 삭제에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  refresh();
  return { error: null };
}
