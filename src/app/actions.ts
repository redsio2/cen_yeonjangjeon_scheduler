"use server";

import { refresh } from "next/cache";
import { insertSchedule } from "@/db/schedules";
import { validateSchedule } from "@/lib/validateSchedule";
import { ScheduleFormValues } from "@/types/schedule";

export async function addSchedule(
  values: ScheduleFormValues
): Promise<{ error: string | null }> {
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

  refresh();
  return { error: null };
}
