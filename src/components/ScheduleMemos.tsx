"use client";

import { FormEvent, useState, useTransition } from "react";
import { validateMemo } from "@/lib/validateMemo";
import {
  ActionResult,
  MEMO_LIMIT_PER_SCHEDULE,
  MEMO_MAX_LENGTH,
  ScheduleMemo,
} from "@/types/schedule";

// A fixed time zone keeps the server render and client hydration identical
// (the server may run in UTC while the team's browsers are in KST).
const MEMO_TIME_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function formatMemoTime(ms: number) {
  const parts = Object.fromEntries(
    MEMO_TIME_FORMAT.formatToParts(ms).map((part) => [part.type, part.value])
  );
  return `${parts.year}년 ${parts.month}월 ${parts.day}일 ${parts.hour}:${parts.minute}`;
}

interface ScheduleMemosProps {
  scheduleId: string;
  memos: ScheduleMemo[];
  onAdd: (scheduleId: string, content: string) => Promise<ActionResult>;
  onDelete: (memoId: string) => Promise<ActionResult>;
}

export default function ScheduleMemos({ scheduleId, memos, onAdd, onDelete }: ScheduleMemosProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<ReadonlySet<string>>(new Set());
  const [isAdding, startAdd] = useTransition();
  const [, startDelete] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationError = validateMemo(content);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const submitted = content;
    startAdd(async () => {
      const result = await onAdd(scheduleId, submitted.trim());
      if (result.error) {
        setError(result.error);
        return;
      }
      // Keep anything the user typed while the request was in flight.
      setContent((current) => (current === submitted ? "" : current));
    });
  }

  function handleDelete(memoId: string) {
    if (!window.confirm("이 메모를 삭제할까요?")) return;

    setError(null);
    setDeletingIds((prev) => new Set(prev).add(memoId));
    startDelete(async () => {
      const result = await onDelete(memoId);
      if (result.error) setError(result.error);
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(memoId);
        return next;
      });
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        메모 ({memos.length})
      </h4>

      {memos.length > 0 && (
        <ul className="flex flex-col gap-2">
          {memos.map((memo) => (
            <li
              key={memo.id}
              className="flex items-start justify-between gap-3 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60"
            >
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap break-words text-sm text-zinc-800 dark:text-zinc-200">
                  {memo.content}
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  {formatMemoTime(memo.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(memo.id)}
                disabled={deletingIds.has(memo.id)}
                className="shrink-0 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-400 dark:hover:bg-red-500/15 dark:hover:text-red-400"
              >
                {deletingIds.has(memo.id) ? "삭제 중..." : "삭제"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {memos.length >= MEMO_LIMIT_PER_SCHEDULE ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          메모는 일정당 최대 {MEMO_LIMIT_PER_SCHEDULE}개까지 남길 수 있습니다.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="메모를 입력하세요"
            aria-label="새 메모"
            rows={2}
            maxLength={MEMO_MAX_LENGTH}
            className="flex-1 resize-y rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="self-start rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isAdding ? "추가 중..." : "메모 추가"}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}
