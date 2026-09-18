"use client";

import { useState } from "react";
import ScheduleForm from "@/components/ScheduleForm";
import ScheduleList from "@/components/ScheduleList";
import { Schedule, ScheduleFormValues } from "@/types/schedule";

export default function Home() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  function handleAddSchedule(values: ScheduleFormValues) {
    const newSchedule: Schedule = {
      ...values,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setSchedules((prev) => [newSchedule, ...prev]);
  }

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-8 px-6 py-12 sm:px-10">
        <header>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            일정 관리
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            촬영, 편집, 미팅, 납품 일정을 등록하고 관리하세요.
          </p>
        </header>

        <ScheduleForm onSubmit={handleAddSchedule} />

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            등록된 일정 ({schedules.length})
          </h2>
          <ScheduleList schedules={schedules} />
        </section>
      </main>
    </div>
  );
}
