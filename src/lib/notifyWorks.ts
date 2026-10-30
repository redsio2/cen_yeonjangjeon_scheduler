import "server-only";
import { createSign } from "node:crypto";
import { ScheduleFormValues } from "@/types/schedule";

const WORKS_TOKEN_URL = "https://auth.worksmobile.com/oauth2/v2.0/token";
const WORKS_API_URL = "https://www.worksapis.com/v1.0";
const WORKS_TIMEOUT_MS = 5000;
// Refresh a little before the token actually expires.
const TOKEN_EXPIRY_MARGIN_MS = 60_000;

let cachedToken: { value: string; expiresAt: number } | null = null;

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

/** Service-account JWT (RS256) that NAVER WORKS exchanges for an access token. */
function createAssertion(clientId: string, serviceAccount: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ iss: clientId, sub: serviceAccount, iat: now, exp: now + 3600 })
  );
  const signature = createSign("RSA-SHA256").update(`${header}.${payload}`).sign(privateKey);
  return `${header}.${payload}.${base64url(signature)}`;
}

async function getAccessToken(config: {
  clientId: string;
  clientSecret: string;
  serviceAccount: string;
  privateKey: string;
}) {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const res = await fetch(WORKS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      assertion: createAssertion(config.clientId, config.serviceAccount, config.privateKey),
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      scope: "bot",
    }),
    signal: AbortSignal.timeout(WORKS_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`token request failed: ${res.status} ${await res.text()}`);
  }

  const data: { access_token: string; expires_in: string | number } = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in) * 1000 - TOKEN_EXPIRY_MARGIN_MS,
  };
  return cachedToken.value;
}

/**
 * Sends a new-schedule notice as a NAVER WORKS bot message to WORKS_USER_ID.
 * Never throws: a failed notification must not fail the schedule it reports.
 */
export async function worksScheduleCreated(values: ScheduleFormValues) {
  const clientId = process.env.WORKS_CLIENT_ID;
  const clientSecret = process.env.WORKS_CLIENT_SECRET;
  const serviceAccount = process.env.WORKS_SERVICE_ACCOUNT;
  const botId = process.env.WORKS_BOT_ID;
  const userId = process.env.WORKS_USER_ID;
  // Env stores like Vercel keep "\n" literally, so restore the PEM line breaks.
  const privateKey = process.env.WORKS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientId || !clientSecret || !serviceAccount || !botId || !userId || !privateKey) return;

  const text = [
    `📅 새 일정이 등록되었습니다`,
    `[${values.type}] ${values.title}`,
    `• 일시: ${values.date} ${values.startTime} - ${values.endTime}`,
    `• 담당자: ${values.assignee}`,
    `• 장소: ${values.location}`,
  ].join("\n");

  try {
    const token = await getAccessToken({ clientId, clientSecret, serviceAccount, privateKey });
    const res = await fetch(
      `${WORKS_API_URL}/bots/${encodeURIComponent(botId)}/users/${encodeURIComponent(userId)}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: { type: "text", text } }),
        signal: AbortSignal.timeout(WORKS_TIMEOUT_MS),
      }
    );
    if (!res.ok) {
      if (res.status === 401) cachedToken = null;
      console.error("NAVER WORKS notification failed", res.status, await res.text());
    }
  } catch (e) {
    console.error("NAVER WORKS notification failed", e);
  }
}
