"use client";

import { useEffect, useState } from "react";
import { STORE, getStoreStatus, type StoreStatus as Status } from "@/lib/store-info";

const LABELS: Record<Status, string> = {
  open: `営業中　${STORE.hours.closes}まで`,
  before: `本日 ${STORE.hours.opens} オープン`,
  after: "本日の営業は終了しました",
  closed: "本日は定休日です",
};

// 営業状況は閲覧時刻で変わるため、静的HTMLには営業時間だけを出してブラウザで更新する
export default function StoreStatus() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const update = () => setStatus(getStoreStatus());
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className={`status${status === "open" ? " is-open" : ""}`} aria-live="polite">
      {status ? LABELS[status] : `営業時間 ${STORE.hours.label}`}
    </span>
  );
}
