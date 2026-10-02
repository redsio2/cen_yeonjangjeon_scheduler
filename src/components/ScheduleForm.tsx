"use client";

import { FormEvent, useState, useTransition } from "react";
import { validateSchedule } from "@/lib/validateSchedule";
import { SCHEDULE_TYPES, ScheduleFormValues, ScheduleType } from "@/types/schedule";

const EMPTY_FORM: ScheduleFormValues = {
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  type: SCHEDULE_TYPES[0],
  assignee: "",
  location: "",
};

interface ScheduleFormProps {
  onSubmit: (values: ScheduleFormValues) => Promise<{ error: string | null }>;
}

export default function ScheduleForm({ onSubmit }: ScheduleFormProps) {
  const [values, setValues] = useState<ScheduleFormValues>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange<K extends keyof ScheduleFormValues>(
    key: K,
    value: ScheduleFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationError = validateSchedule(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await onSubmit({
        ...values,
        title: values.title.trim(),
        assignee: values.assignee.trim(),
        location: values.location.trim(),
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setValues(EMPTY_FORM);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        일정 등록
      </h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          일정 제목
        </label>
        <input
          id="title"
          type="text"
          value={values.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="예: 브랜드 홍보 영상 촬영"
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="date" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            날짜
          </label>
          <input
            id="date"
            type="date"
            value={values.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="startTime" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            시작 시간
          </label>
          <input
            id="startTime"
            type="time"
            value={values.startTime}
            onChange={(e) => handleChange("startTime", e.target.value)}
            className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="endTime" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            종료 시간
          </label>
          <input
            id="endTime"
            type="time"
            value={values.endTime}
            onChange={(e) => handleChange("endTime", e.target.value)}
            className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="type" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            유형
          </label>
          <select
            id="type"
            value={values.type}
            onChange={(e) => handleChange("type", e.target.value as ScheduleType)}
            className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
          >
            {SCHEDULE_TYPES.map((type) => (
              <option key={type} value={type} className="dark:bg-zinc-900">
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="assignee" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            담당자
          </label>
          <input
            id="assignee"
            type="text"
            value={values.assignee}
            onChange={(e) => handleChange("assignee", e.target.value)}
            placeholder="예: 홍수정"
            className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="location" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            장소
          </label>
          <input
            id="location"
            type="text"
            value={values.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="예: 스튜디오 A"
            className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 self-start rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isPending ? "등록 중..." : "일정 등록"}
      </button>
    </form>
  );
}
