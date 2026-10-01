"use client";

import { jstNow, resolveDay } from "@/lib/business-calendar";
import { useBusinessCalendar, useNow } from "@/components/useBusinessCalendar";
import ShareCalendarButton from "@/components/ShareCalendarButton";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// 休業日の印（Instagram の営業日カレンダーと同じ、丸くなった猫）
function CatIcon() {
  return (
    <svg viewBox="0 0 32 26" className="h-5 w-6 sm:h-6 sm:w-7" aria-hidden="true" fill="currentColor">
      <path d="M6 5 9.5 10C11.5 9.2 13.6 8.8 16 8.8s4.5.4 6.5 1.2L26 5l.6 7.4c2.4 2.2 3.9 4.9 3.9 7.6 0 4-6.5 6-14.5 6S1.5 24 1.5 20c0-2.7 1.5-5.4 3.9-7.6L6 5Z" />
    </svg>
  );
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function Month({ year, month, today }: { year: number; month: number; today: string }) {
  const { data } = useBusinessCalendar();
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: lastDay }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  // その月の「時間変更・メモ」を一覧で補足する
  const notes: string[] = [];

  return (
    <div>
      <table className="w-full table-fixed border-collapse text-center">
        <caption className="mb-2 text-left font-display text-lg font-semibold num">
          {year}.{pad(month)}
        </caption>
        <thead>
          <tr>
            {WEEKDAYS.map((w) => (
              <th key={w} scope="col" className="pb-1 text-xs font-medium text-muted">{w}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((day, j) => {
                if (!day) return <td key={j} className="border border-rule bg-surface" />;
                const date = `${year}-${pad(month)}-${pad(day)}`;
                const info = resolveDay(data, date);
                const changedHours = !info.closed && info.special;
                if ((changedHours || info.note) && date >= today) {
                  notes.push(`${month}/${day}${changedHours ? ` ${info.opens}〜${info.closes}` : " お休み"}${info.note ? `（${info.note}）` : ""}`);
                }
                const label = `${month}月${day}日（${WEEKDAYS[info.weekday]}）${
                  info.closed ? "お休み" : changedHours ? `${info.opens}〜${info.closes}の営業` : "営業"
                }${info.note ? `、${info.note}` : ""}`;
                return (
                  <td
                    key={j}
                    aria-label={label}
                    className={`h-12 border border-rule align-top sm:h-14 ${date === today ? "outline-2 -outline-offset-2 outline-ink" : ""} ${date < today ? "opacity-50" : ""}`}
                  >
                    <div className="flex h-full flex-col items-center justify-start gap-0.5 pt-1" aria-hidden="true">
                      <span className="num text-xs leading-none">{day}</span>
                      {info.closed && (
                        <span className="text-ink-2">
                          <CatIcon />
                        </span>
                      )}
                      {changedHours && <span className="num text-[10px] leading-tight text-ink-2">{info.opens}〜</span>}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {notes.length > 0 && (
        <ul className="mt-3 grid gap-1 text-sm text-ink-2">
          {notes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      )}
    </div>
  );
}

// 今月と来月の営業日カレンダー（管理画面の設定をブラウザで直接読み込むので、保存するとすぐ反映される）
export default function BusinessCalendar({ months = 2 }: { months?: number }) {
  const now = useNow();

  if (!now) {
    // 日付はブラウザで決まるので、読み込み前は同じ高さの枠だけを出す（レイアウトのずれを防ぐ）
    return <div className={`grid gap-8 ${months > 1 ? "md:grid-cols-2" : ""}`} aria-hidden="true">
      {Array.from({ length: months }, (_, i) => <div key={i} className="h-[340px] bg-surface sm:h-[380px]" />)}
    </div>;
  }

  const today = jstNow(now).date;
  const [year, month] = today.split("-").map(Number);
  const targets = Array.from({ length: months }, (_, i) => {
    const d = new Date(Date.UTC(year, month - 1 + i, 1));
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
  });

  return (
    <div>
      <div className={`grid gap-8 ${months > 1 ? "md:grid-cols-2" : ""}`}>
        {targets.map((t) => <Month key={`${t.year}-${t.month}`} {...t} today={today} />)}
      </div>
      <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1 text-ink-2"><CatIcon /> お休み</span>
        <span>時刻の表示がある日は営業時間が変わります</span>
      </p>
      <ShareCalendarButton months={targets.map((t) => `${t.year}-${pad(t.month)}`)} />
    </div>
  );
}
