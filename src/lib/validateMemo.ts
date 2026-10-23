import { MEMO_MAX_LENGTH } from "@/types/schedule";

/** Returns a user-facing error message, or null if the memo content is valid. */
export function validateMemo(content: string): string | null {
  if (!content.trim()) {
    return "메모 내용을 입력해주세요.";
  }

  if (content.trim().length > MEMO_MAX_LENGTH) {
    return `메모는 ${MEMO_MAX_LENGTH}자 이내로 입력해주세요.`;
  }

  return null;
}
