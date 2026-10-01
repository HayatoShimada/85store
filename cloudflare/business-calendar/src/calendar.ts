// 営業日データの型・検証・D1 の読み書き

export type DayOverride =
  | { kind: "closed"; note?: string }
  | { kind: "hours"; opens: string; closes: string; note?: string };

export interface Regular {
  opens: string;
  closes: string;
  closedWeekdays: number[]; // 0=日曜 … 6=土曜
}

export interface CalendarResponse {
  regular: Regular;
  days: Record<string, DayOverride>;
  updatedAt: string;
}

export class ValidationError extends Error {}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const NOTE_MAX = 100;
const MAX_RANGE_DAYS = 400;

export function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function assertTime(value: unknown, label: string): string {
  if (typeof value !== "string" || !TIME_RE.test(value)) {
    throw new ValidationError(`${label}は HH:MM の形式で入力してください`);
  }
  return value;
}

function assertHours(opens: unknown, closes: unknown): { opens: string; closes: string } {
  const o = assertTime(opens, "開店時刻");
  const c = assertTime(closes, "閉店時刻");
  if (o >= c) throw new ValidationError("閉店時刻は開店時刻より後にしてください");
  return { opens: o, closes: c };
}

function assertNote(note: unknown): string | undefined {
  if (note === undefined || note === null || note === "") return undefined;
  if (typeof note !== "string") throw new ValidationError("メモは文字列で入力してください");
  const trimmed = note.trim();
  if (trimmed.length > NOTE_MAX) throw new ValidationError(`メモは${NOTE_MAX}文字以内にしてください`);
  return trimmed || undefined;
}

export function parseDayOverride(body: unknown): DayOverride {
  const input = (body ?? {}) as Record<string, unknown>;
  const note = assertNote(input.note);
  if (input.kind === "closed") return { kind: "closed", ...(note && { note }) };
  if (input.kind === "hours") return { kind: "hours", ...assertHours(input.opens, input.closes), ...(note && { note }) };
  throw new ValidationError("kind は closed か hours を指定してください");
}

export function parseRegular(body: unknown): Regular {
  const input = (body ?? {}) as Record<string, unknown>;
  const weekdays = input.closedWeekdays;
  if (!Array.isArray(weekdays) || !weekdays.every((d) => Number.isInteger(d) && d >= 0 && d <= 6)) {
    throw new ValidationError("定休曜日は 0〜6 の配列で指定してください");
  }
  return { ...assertHours(input.opens, input.closes), closedWeekdays: [...new Set(weekdays as number[])].sort() };
}

// 日本時間の今日（YYYY-MM-DD）
export function todayJst(now = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// 取得範囲。指定がなければ「7日前〜120日後」
export function parseRange(url: URL): { from: string; to: string } {
  const today = todayJst();
  const from = url.searchParams.get("from") ?? addDays(today, -7);
  const to = url.searchParams.get("to") ?? addDays(today, 120);
  if (!isValidDate(from) || !isValidDate(to)) throw new ValidationError("from / to は YYYY-MM-DD で指定してください");
  if (from > to) throw new ValidationError("from は to 以前の日付にしてください");
  const span = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000;
  if (span > MAX_RANGE_DAYS) throw new ValidationError(`期間は${MAX_RANGE_DAYS}日以内にしてください`);
  return { from, to };
}

interface SettingsRow {
  opens: string;
  closes: string;
  closed_weekdays: string;
  updated_at: string;
}

interface DayRow {
  date: string;
  kind: "closed" | "hours";
  opens: string | null;
  closes: string | null;
  note: string | null;
  updated_at: string;
}

export async function readCalendar(db: D1Database, from: string, to: string): Promise<CalendarResponse> {
  const [settingsResult, daysResult] = await db.batch([
    db.prepare("SELECT opens, closes, closed_weekdays, updated_at FROM settings WHERE id = 1"),
    db.prepare("SELECT date, kind, opens, closes, note, updated_at FROM days WHERE date BETWEEN ? AND ? ORDER BY date").bind(from, to),
  ]);
  const settings = (settingsResult.results as unknown as SettingsRow[])[0];
  if (!settings) throw new Error("settings row is missing (run the D1 migration)");

  let updatedAt = settings.updated_at;
  const days: Record<string, DayOverride> = {};
  for (const row of daysResult.results as unknown as DayRow[]) {
    const note = row.note ?? undefined;
    days[row.date] =
      row.kind === "closed"
        ? { kind: "closed", ...(note && { note }) }
        : { kind: "hours", opens: row.opens ?? "", closes: row.closes ?? "", ...(note && { note }) };
    if (row.updated_at > updatedAt) updatedAt = row.updated_at;
  }

  return {
    regular: { opens: settings.opens, closes: settings.closes, closedWeekdays: JSON.parse(settings.closed_weekdays) },
    days,
    updatedAt,
  };
}

export async function upsertDay(db: D1Database, date: string, day: DayOverride, by: string): Promise<void> {
  await db
    .prepare(
      `INSERT INTO days (date, kind, opens, closes, note, updated_at, updated_by)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
       ON CONFLICT(date) DO UPDATE SET kind = ?2, opens = ?3, closes = ?4, note = ?5, updated_at = ?6, updated_by = ?7`
    )
    .bind(
      date,
      day.kind,
      day.kind === "hours" ? day.opens : null,
      day.kind === "hours" ? day.closes : null,
      day.note ?? null,
      new Date().toISOString(),
      by
    )
    .run();
}

export async function deleteDay(db: D1Database, date: string): Promise<void> {
  await db.prepare("DELETE FROM days WHERE date = ?").bind(date).run();
}

export async function updateRegular(db: D1Database, regular: Regular, by: string): Promise<void> {
  await db
    .prepare("UPDATE settings SET opens = ?, closes = ?, closed_weekdays = ?, updated_at = ?, updated_by = ? WHERE id = 1")
    .bind(regular.opens, regular.closes, JSON.stringify(regular.closedWeekdays), new Date().toISOString(), by)
    .run();
}
