"use client";

import { useSyncExternalStore } from "react";
import { CALENDAR_API_URL, DEFAULT_CALENDAR, parseCalendarData, type CalendarData } from "@/lib/business-calendar";

// 営業日カレンダーをブラウザから直接取得し、ページ内のコンポーネントで共有する。
// 管理画面で保存した内容が、再デプロイなしで表示に反映される（表示時・60秒ごと・タブに戻ったとき）。

const REFRESH_MS = 60_000;

interface Snapshot {
  data: CalendarData;
  loaded: boolean; // APIから取得できたか（false の間は既定のルールで表示）
}

const SERVER_SNAPSHOT: Snapshot = { data: DEFAULT_CALENDAR, loaded: false };

let snapshot: Snapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function emit() {
  listeners.forEach((listener) => listener());
}

async function refresh() {
  try {
    const response = await fetch(`${CALENDAR_API_URL}/v1/calendar`, { cache: "no-store" });
    if (!response.ok) return;
    const data = parseCalendarData(await response.json());
    if (!data) return;
    snapshot = { data, loaded: true };
    emit();
  } catch {
    // 取得できなければ前回の内容（初回は既定のルール）のまま表示する
  }
}

function onVisibilityChange() {
  if (document.visibilityState === "visible") refresh();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    refresh();
    timer = setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", onVisibilityChange);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    }
  };
}

export function useBusinessCalendar(): Snapshot {
  return useSyncExternalStore(subscribe, () => snapshot, () => SERVER_SNAPSHOT);
}

// フックの外（イベントハンドラなど）から最新のカレンダーを読む
export function getBusinessCalendar(): CalendarData {
  return snapshot.data;
}

// 現在時刻（1分ごとに更新）。サーバーでは null を返し、時刻に依存する表示はブラウザで描く
const clockListeners = new Set<() => void>();
let clockTimer: ReturnType<typeof setInterval> | undefined;
let currentMinute = 0;

function subscribeClock(listener: () => void) {
  clockListeners.add(listener);
  if (clockListeners.size === 1) {
    clockTimer = setInterval(() => {
      currentMinute = Math.floor(Date.now() / 60_000);
      clockListeners.forEach((l) => l());
    }, 15_000);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0) clearInterval(clockTimer);
  };
}

function getMinute() {
  // 初回の読み取りでも現在時刻を返す（15秒ごとの更新で分が変わったら再描画される）
  if (!currentMinute) currentMinute = Math.floor(Date.now() / 60_000);
  return currentMinute;
}

export function useNow(): Date | null {
  const minute = useSyncExternalStore(subscribeClock, getMinute, () => 0);
  return minute ? new Date(minute * 60_000) : null;
}
