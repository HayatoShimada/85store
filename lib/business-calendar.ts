import { STORE } from "@/lib/store-info";

// 営業日カレンダー（管理画面: cloudflare/business-calendar）のデータと判定ロジック。
// サーバーとブラウザの両方で使う純粋関数だけを置く。

export type DayOverride =
  | { kind: "closed"; note?: string }
  | { kind: "hours"; opens: string; closes: string; note?: string };

export interface CalendarData {
  regular: { opens: string; closes: string; closedWeekdays: number[] };
  days: Record<string, DayOverride>; // キーは日本時間の YYYY-MM-DD
  updatedAt?: string;
}

// 営業日APIの公開エンドポイント（読み取り専用・キャッシュなし）
export const CALENDAR_API_URL = process.env.NEXT_PUBLIC_CALENDAR_API_URL || "https://calendar.85-store.com";

// APIが使えないときの既定値（通常の営業時間・定休曜日）
export const DEFAULT_CALENDAR: CalendarData = {
  regular: {
    opens: STORE.hours.opens,
    closes: STORE.hours.closes,
    closedWeekdays: [...STORE.hours.closedWeekdays],
  },
  days: {},
};

export interface ResolvedDay {
  date: string;
  weekday: number; // 0=日曜 … 6=土曜
  closed: boolean;
  regularClosed: boolean; // 定休曜日による休み
  special: boolean; // 管理画面で個別に設定された日
  opens?: string;
  closes?: string;
  note?: string;
}

export type StatusState = "open" | "before" | "after" | "closed";

export interface StoreStatusInfo extends ResolvedDay {
  state: StatusState;
}

// 日本時間の日付（YYYY-MM-DD）と、0時からの経過分
export function jstNow(now: Date): { date: string; minutes: number } {
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return { date: jst.toISOString().slice(0, 10), minutes: jst.getUTCHours() * 60 + jst.getUTCMinutes() };
}

export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function resolveDay(data: CalendarData, date: string): ResolvedDay {
  const weekday = weekdayOf(date);
  const override = data.days[date];
  if (override?.kind === "closed") {
    return { date, weekday, closed: true, regularClosed: false, special: true, note: override.note };
  }
  if (override?.kind === "hours") {
    return { date, weekday, closed: false, regularClosed: false, special: true, opens: override.opens, closes: override.closes, note: override.note };
  }
  const regularClosed = data.regular.closedWeekdays.includes(weekday);
  return regularClosed
    ? { date, weekday, closed: true, regularClosed: true, special: false }
    : { date, weekday, closed: false, regularClosed: false, special: false, opens: data.regular.opens, closes: data.regular.closes };
}

export function getStatusAt(data: CalendarData, now: Date): StoreStatusInfo {
  const { date, minutes } = jstNow(now);
  const day = resolveDay(data, date);
  if (day.closed || !day.opens || !day.closes) return { ...day, state: "closed" };
  if (minutes < toMinutes(day.opens)) return { ...day, state: "before" };
  if (minutes >= toMinutes(day.closes)) return { ...day, state: "after" };
  return { ...day, state: "open" };
}

// APIの応答を検証して取り込む（形が不正なら null）
export function parseCalendarData(value: unknown): CalendarData | null {
  const input = value as Partial<CalendarData> | null;
  const regular = input?.regular;
  if (
    !regular ||
    typeof regular.opens !== "string" ||
    typeof regular.closes !== "string" ||
    !Array.isArray(regular.closedWeekdays) ||
    typeof input?.days !== "object" ||
    input.days === null
  ) {
    return null;
  }
  return { regular, days: input.days, updatedAt: input.updatedAt };
}
