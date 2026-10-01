"use client";

import { useEffect, useRef, useState } from "react";
import { CALENDAR_API_URL, type CalendarData } from "@/lib/business-calendar";
import { useBusinessCalendar } from "@/components/useBusinessCalendar";

// 営業日カレンダーの画像を、OS 標準の方法で共有する
// iOS: 共有シート / Android: Sharesheet / デスクトップ: Web Share API（使えなければ画像を保存してリンクをコピー）
// 画像は営業日カレンダーの Worker が配信するモジュール（calendar-image.js）で、ブラウザの canvas に描く。

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://85-store.com";
const SHARE_URL = `${siteUrl}/reserve`;
const SHARE_TEXT = "85-Store（ハコストア）の営業日カレンダー";

type ShareResult = "shared" | "cancelled" | "unsupported";
interface ImageLib {
  renderCalendarImage(options: Record<string, unknown>): Promise<Blob>;
  shareFiles(data: { files: File[]; text?: string; url?: string }): Promise<ShareResult>;
  toFile(blob: Blob, name: string): File;
  downloadBlob(blob: Blob, name: string): void;
}

let libPromise: Promise<ImageLib> | null = null;
function loadLib(): Promise<ImageLib> {
  libPromise ??= import(/* webpackIgnore: true */ /* turbopackIgnore: true */ `${CALENDAR_API_URL}/calendar-image.js`) as Promise<ImageLib>;
  return libPromise;
}

async function buildFiles(data: CalendarData, months: string[]): Promise<File[]> {
  const lib = await loadLib();
  const root = getComputedStyle(document.documentElement);
  const files: File[] = [];
  for (const month of months) {
    const blob = await lib.renderCalendarImage({
      data,
      month,
      language: "ja",
      storeName: "85-Store",
      footer: SHARE_URL.replace(/^https?:\/\//, ""),
      closedMark: "cat",
      // サイトと同じ書体（next/font が付けた名前を CSS 変数から読む）
      fonts: { sans: root.getPropertyValue("--font-sans").trim() || undefined, display: root.getPropertyValue("--font-display").trim() || undefined },
    });
    files.push(lib.toFile(blob, `85store-calendar-${month}.png`));
  }
  return files;
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

export default function ShareCalendarButton({ months }: { months: string[] }) {
  const { data, loaded } = useBusinessCalendar();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const prepared = useRef<{ key: string; files: File[] } | null>(null);
  const monthsKey = months.join(",");
  const key = loaded ? `${data.updatedAt ?? ""}|${monthsKey}` : null;

  // タップした瞬間に共有シートを開けるよう、画像は手の空いたときに先に作っておく
  useEffect(() => {
    if (!key || prepared.current?.key === key) return;
    let cancelled = false;
    const run = () =>
      buildFiles(data, monthsKey.split(","))
        .then((files) => {
          if (!cancelled) prepared.current = { key, files };
        })
        .catch(() => {});
    const idle = "requestIdleCallback" in window;
    const id = idle ? requestIdleCallback(run, { timeout: 3000 }) : window.setTimeout(run, 1000);
    return () => {
      cancelled = true;
      if (idle) cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, [key, data, monthsKey]);

  async function share() {
    setBusy(true);
    setStatus("");
    try {
      const lib = await loadLib();
      const files = prepared.current?.key === key ? prepared.current.files : await buildFiles(data, months);
      const result = await lib.shareFiles({ files, text: SHARE_TEXT, url: SHARE_URL });
      if (result === "unsupported") {
        files.forEach((file) => lib.downloadBlob(file, file.name));
        await navigator.clipboard?.writeText(SHARE_URL).catch(() => {});
        setStatus("画像を保存し、リンクをコピーしました");
      }
    } catch {
      setStatus("共有できませんでした。時間をおいてもう一度お試しください");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      <button type="button" className="btn btn-secondary gap-2" onClick={share} disabled={!loaded || busy}>
        <ShareIcon />
        カレンダーを共有
      </button>
      <p className="mt-2 text-xs text-muted" role="status" aria-live="polite">{status}</p>
    </div>
  );
}
