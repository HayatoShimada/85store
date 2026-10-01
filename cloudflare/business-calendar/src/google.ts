import { readCalendar, todayJst, type DayOverride, type Regular } from "./calendar";

// Googleマップ（ビジネスプロフィール）の通常営業時間・特別営業時間を、管理画面の内容に合わせる。
// Business Profile API の利用承認と、下の secret の設定が済むまでは何もしない。

export interface GoogleEnv {
  DB: D1Database;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
  GOOGLE_LOCATION_ID?: string; // "locations/123..." の数字部分
  // テスト用: Google の各エンドポイントを差し替える
  GOOGLE_TOKEN_URL?: string;
  GOOGLE_API_BASE?: string;
}

// 今日から何日先までの特別営業時間を Google に送るか
const SYNC_DAYS = 180;
const DAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export function isGoogleConfigured(env: GoogleEnv): boolean {
  return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN && env.GOOGLE_LOCATION_ID);
}

function timeOfDay(hhmm: string) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return { hours, minutes };
}

function dateOf(ymd: string) {
  const [year, month, day] = ymd.split("-").map(Number);
  return { year, month, day };
}

// 通常の営業時間（定休曜日以外の曜日ごとに開店〜閉店）
export function buildRegularHours(regular: Regular) {
  return {
    periods: DAY_NAMES.flatMap((day, index) =>
      regular.closedWeekdays.includes(index)
        ? []
        : [{ openDay: day, openTime: timeOfDay(regular.opens), closeDay: day, closeTime: timeOfDay(regular.closes) }]
    ),
  };
}

// 特別営業時間（臨時休業と、その日だけの営業時間）
export function buildSpecialHours(days: Record<string, DayOverride>) {
  return {
    specialHourPeriods: Object.entries(days)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, day]) =>
        day.kind === "closed"
          ? { startDate: dateOf(date), closed: true }
          : {
              startDate: dateOf(date),
              openTime: timeOfDay(day.opens),
              endDate: dateOf(date),
              closeTime: timeOfDay(day.closes),
              closed: false,
            }
      ),
  };
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function getAccessToken(env: GoogleEnv): Promise<string> {
  const response = await fetch(env.GOOGLE_TOKEN_URL || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      refresh_token: env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const body = (await response.json().catch(() => ({}))) as { access_token?: string; error?: string; error_description?: string };
  if (!response.ok || !body.access_token) {
    throw new Error(`Googleの認証に失敗しました（${body.error_description || body.error || response.status}）`);
  }
  return body.access_token;
}

export interface SyncStatus {
  configured: boolean;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
}

export async function readSyncStatus(env: GoogleEnv): Promise<SyncStatus> {
  const row = await env.DB.prepare("SELECT last_attempt_at, last_success_at, last_error FROM sync_status WHERE id = 1").first<{
    last_attempt_at: string | null;
    last_success_at: string | null;
    last_error: string | null;
  }>();
  return {
    configured: isGoogleConfigured(env),
    lastAttemptAt: row?.last_attempt_at ?? null,
    lastSuccessAt: row?.last_success_at ?? null,
    lastError: row?.last_error ?? null,
  };
}

// Google に送る。結果は sync_status に記録し、失敗しても例外は外に出さない（保存自体は成功しているため）
export async function syncToGoogle(env: GoogleEnv): Promise<SyncStatus> {
  if (!isGoogleConfigured(env)) return readSyncStatus(env);

  const now = new Date().toISOString();
  try {
    const today = todayJst();
    const { regular, days } = await readCalendar(env.DB, today, addDays(today, SYNC_DAYS));
    const accessToken = await getAccessToken(env);
    const base = env.GOOGLE_API_BASE || "https://mybusinessbusinessinformation.googleapis.com";
    const response = await fetch(
      `${base}/v1/locations/${env.GOOGLE_LOCATION_ID}?updateMask=regularHours,specialHours`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ regularHours: buildRegularHours(regular), specialHours: buildSpecialHours(days) }),
      }
    );
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      throw new Error(`Googleマップへの反映に失敗しました（${response.status}）: ${detail}`);
    }
    await env.DB.prepare("UPDATE sync_status SET last_attempt_at = ?1, last_success_at = ?1, last_error = NULL WHERE id = 1").bind(now).run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Google sync failed:", message);
    await env.DB.prepare("UPDATE sync_status SET last_attempt_at = ?, last_error = ? WHERE id = 1").bind(now, message).run();
  }
  return readSyncStatus(env);
}
