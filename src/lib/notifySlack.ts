import "server-only";
import { ScheduleFormValues } from "@/types/schedule";

const SLACK_TIMEOUT_MS = 5000;

// Slack mrkdwn treats &, < and > as control characters.
function escapeSlack(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Posts a new-schedule notice to the Slack Incoming Webhook in SLACK_WEBHOOK_URL.
 * Never throws: a failed notification must not fail the schedule it reports.
 */
export async function notifyScheduleCreated(values: ScheduleFormValues) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const text = [
    `:calendar: *새 일정이 등록되었습니다*`,
    `*[${values.type}] ${escapeSlack(values.title)}*`,
    `• 일시: ${values.date} ${values.startTime} - ${values.endTime}`,
    `• 담당자: ${escapeSlack(values.assignee)}`,
    `• 장소: ${escapeSlack(values.location)}`,
  ].join("\n");

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(SLACK_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("Slack notification failed", res.status, await res.text());
    }
  } catch (e) {
    console.error("Slack notification failed", e);
  }
}
