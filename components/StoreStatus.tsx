"use client";

import { getStatusAt, type StoreStatusInfo } from "@/lib/business-calendar";
import { STORE } from "@/lib/store-info";
import { useBusinessCalendar, useNow } from "@/components/useBusinessCalendar";

function labelOf(status: StoreStatusInfo): string {
  switch (status.state) {
    case "open":
      return `営業中　${status.closes}まで`;
    case "before":
      return `本日 ${status.opens} オープン`;
    case "after":
      return "本日の営業は終了しました";
    case "closed":
      return status.regularClosed ? "本日は定休日です" : "本日はお休みです";
  }
}

// 営業状況は閲覧時刻と営業日カレンダーで変わるため、静的HTMLには営業時間だけを出してブラウザで更新する
// action には営業状況の横に並べるボタンなどを渡す
export default function StoreStatus({ action }: { action?: React.ReactNode }) {
  const { data } = useBusinessCalendar();
  const now = useNow();
  const status = now ? getStatusAt(data, now) : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`status${status?.state === "open" ? " is-open" : ""}`} aria-live="polite">
        {status ? labelOf(status) : `営業時間 ${STORE.hours.label}`}
      </span>
      {action}
      {status?.note && <span className="basis-full text-sm text-muted">{status.note}</span>}
    </div>
  );
}
