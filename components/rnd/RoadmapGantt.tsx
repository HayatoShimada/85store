import Phrase from "@/components/Phrase";
import { PHASES, PILLARS, type RoadmapItem } from "@/lib/rnd";

// ロードマップのガントチャート（GitHub Project の開始日・終了日）。月を同じ幅で並べ、横にはみ出す分は枠の中でスクロールする
const STATUS_LABEL = { done: "完了", doing: "進行中", todo: "これから" } as const;
const BAR_CLASS = {
  done: "bg-ink-2",
  doing: "bg-accent",
  todo: "border border-ink bg-bg",
} as const;

const parse = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d };
};
const monthIndex = (date: string) => {
  const { y, m } = parse(date);
  return y * 12 + (m - 1);
};
// 範囲の最初の月からの位置（月単位。日は月の中の割合）
const position = (date: string, first: number, endOfDay = false) => {
  const { y, m, d } = parse(date);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return monthIndex(date) - first + (d - (endOfDay ? 0 : 1)) / days;
};

export default function RoadmapGantt({ items, today }: { items: RoadmapItem[]; today: string }) {
  const first = Math.min(...items.map((item) => monthIndex(item.start!)));
  const last = Math.max(...items.map((item) => monthIndex(item.end!)));
  const months = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  const pct = (value: number) => `${(Math.max(0, Math.min(value, months.length)) / months.length) * 100}%`;
  const todayAt = position(today, first);
  const showToday = todayAt >= 0 && todayAt <= months.length;
  const gridLines = {
    backgroundImage: "linear-gradient(to right, var(--color-rule) 1px, transparent 1px)",
    backgroundSize: `calc(100% / ${months.length}) 100%`,
  };

  return (
    <div>
      <ul className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-2" aria-label="凡例">
        {(Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((status) => (
          <li key={status} className="flex items-center gap-2">
            <span className={`inline-block h-2.5 w-6 ${BAR_CLASS[status]}`} aria-hidden="true" />
            {STATUS_LABEL[status]}
          </li>
        ))}
        {showToday && (
          <li className="flex items-center gap-2">
            <span className="inline-block h-3 w-px bg-accent-2" aria-hidden="true" />
            今日
          </li>
        )}
      </ul>

      <div className="overflow-x-auto border-y border-ink">
        <div className="grid min-w-[960px] grid-cols-[minmax(220px,280px)_minmax(0,1fr)]">
          {/* 時期と月の見出し */}
          <div className="sticky left-0 z-10 border-r border-rule bg-bg" aria-hidden="true" />
          <div className="relative border-b border-rule" aria-hidden="true">
            <div className="relative h-7 border-b border-rule">
              {PHASES.map((phase, i) => {
                const from = position(phase.from, first);
                const next = PHASES[i + 1];
                const to = next ? position(next.from, first) : months.length;
                if (to <= 0) return null;
                return (
                  <span
                    key={phase.key}
                    className="absolute top-0 flex h-full items-center border-l border-ink pl-2 font-display text-xs font-bold tracking-wide"
                    style={{ left: pct(from), width: `calc(${pct(to)} - ${pct(from)})` }}
                  >
                    {phase.label}
                  </span>
                );
              })}
            </div>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` }}>
              {months.map((month) => (
                <span key={month} className="num border-l border-rule py-1 pl-1.5 text-xs text-muted">
                  {month % 12 === 0 || month === first ? `${Math.floor(month / 12)}.` : ""}
                  {(month % 12) + 1}
                </span>
              ))}
            </div>
          </div>

          {PILLARS.map((pillar) => {
            const rows = items
              .filter((item) => item.pillar === pillar.key)
              .sort((a, b) => a.start!.localeCompare(b.start!) || a.end!.localeCompare(b.end!));
            if (rows.length === 0) return null;
            return (
              <div key={pillar.key} className="contents" role="rowgroup">
                <div className="sticky left-0 z-10 col-span-1 border-r border-b border-rule bg-surface px-3 py-2">
                  <p className="font-display text-sm font-bold">{pillar.name}</p>
                  <p className="text-xs text-muted"><Phrase>{pillar.title}</Phrase></p>
                </div>
                <div className="border-b border-rule bg-surface" style={gridLines} />
                {rows.map((item) => {
                  const from = position(item.start!, first);
                  const to = position(item.end!, first, true);
                  const label = (
                    <>
                      <span className="block truncate">{item.title}</span>
                      <span className="block truncate font-display text-[0.6875rem] text-muted">{item.repo}</span>
                    </>
                  );
                  return (
                    <div key={`${item.title}-${item.start}`} className="contents">
                      <div className="sticky left-0 z-10 min-w-0 border-r border-b border-rule bg-bg px-3 py-1.5 text-[0.8125rem] leading-snug" title={`${item.title}（${STATUS_LABEL[item.status as keyof typeof STATUS_LABEL]}）`}>
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {label}
                            <span className="sr-only"><Phrase>{"（別のサイトで開きます）"}</Phrase></span>
                          </a>
                        ) : (
                          label
                        )}
                      </div>
                      <div className="relative border-b border-rule" style={gridLines}>
                        <span
                          className={`absolute top-1/2 h-2.5 min-w-1.5 -translate-y-1/2 ${BAR_CLASS[item.status as keyof typeof BAR_CLASS]}`}
                          style={{ left: pct(from), width: `calc(${pct(to)} - ${pct(from)})` }}
                          title={`${item.start} 〜 ${item.end}`}
                        />
                        {showToday && <span className="absolute inset-y-0 w-px bg-accent-2" style={{ left: pct(todayAt) }} aria-hidden="true" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
