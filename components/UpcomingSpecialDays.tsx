import { getUpcomingSpecialDays } from "@/lib/business-calendar-server";
import { formatDate } from "@/utils/date";

import Phrase from "@/components/Phrase";
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// 今後の臨時休業・営業時間の変更（サーバーで描く文字の一覧。0件なら何も出さない）
export default async function UpcomingSpecialDays({ className = "" }: { className?: string }) {
  const days = await getUpcomingSpecialDays();
  if (days.length === 0) return null;

  return (
    <div className={`text-sm ${className}`}>
      <p className="font-semibold"><Phrase>{"今後の臨時休業・営業時間の変更"}</Phrase></p>
      <ul className="mt-1 grid gap-1">
      {days.map((day) => (
        <li key={day.date}>
          <time dateTime={day.date} className="num">{formatDate(day.date)}（{WEEKDAYS[day.weekday]}）</time>
          {"　"}
          {day.closed ? "臨時休業" : <>営業時間 <span className="num">{day.opens}〜{day.closes}</span></>}
          {day.note && <span className="opacity-85">（{day.note}）</span>}
        </li>
        ))}
      </ul>
    </div>
  );
}
