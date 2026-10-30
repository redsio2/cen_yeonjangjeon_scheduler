import "server-only";
import { Resend } from "resend";
import { ScheduleFormValues } from "@/types/schedule";

// Resend's shared test sender; it only delivers to the Resend account owner's address
// until a domain is verified and NOTIFY_EMAIL_FROM points at it.
const DEFAULT_FROM = "일정 관리 <onboarding@resend.dev>";

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Emails a new-schedule notice via Resend (RESEND_API_KEY) to NOTIFY_EMAIL_TO.
 * Never throws: a failed notification must not fail the schedule it reports.
 */
export async function emailScheduleCreated(values: ScheduleFormValues) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  if (!apiKey || !to) return;

  const rows: [string, string][] = [
    ["유형", values.type],
    ["일시", `${values.date} ${values.startTime} - ${values.endTime}`],
    ["담당자", values.assignee],
    ["장소", values.location],
  ];

  const html = `
    <h2>새 일정이 등록되었습니다</h2>
    <p><strong>${escapeHtml(values.title)}</strong></p>
    <ul>
      ${rows.map(([label, value]) => `<li>${label}: ${escapeHtml(value)}</li>`).join("")}
    </ul>
  `;

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: process.env.NOTIFY_EMAIL_FROM || DEFAULT_FROM,
      to: to.split(",").map((address) => address.trim()),
      subject: `[일정 등록] [${values.type}] ${values.title}`,
      html,
      text: [`새 일정이 등록되었습니다`, values.title, ...rows.map(([l, v]) => `${l}: ${v}`)].join("\n"),
    });
    if (error) console.error("Email notification failed", error);
  } catch (e) {
    console.error("Email notification failed", e);
  }
}
