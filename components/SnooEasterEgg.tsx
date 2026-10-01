"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { applyTheme } from "@/lib/theme";
import { getStatusAt } from "@/lib/business-calendar";
import { getBusinessCalendar } from "@/components/useBusinessCalendar";

// イースターエッグ「店長スヌーの見回り」
// 呼び方: キーボードで「snoo」またはコナミコマンド / 「85-Store」のロゴタイプを素早く5回タップ
// 呼ぶとドット絵のスヌーが画面の右下からのぞき、タップするたびに話す

const SNOO_WORD = "snoo";
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const TAP_COUNT = 5;
const TAP_WINDOW_MS = 2000;
const VISITED_KEY = "85store-snoo-visited";

const LINES = [
  "オンラインストアも見ていってにゃ。",
  "古着はね、一点ものだから出会いが大事にゃ。",
  "2階の85-UpStoreも、ぼくの見回りコースにゃ。",
  "ブログの写真、タップすると大きくなるにゃ。",
  "……（毛づくろい中）",
];

function greeting(): string {
  let visited = false;
  try {
    visited = localStorage.getItem(VISITED_KEY) === "1";
    localStorage.setItem(VISITED_KEY, "1");
  } catch {
    // 保存できなくても挨拶はする
  }
  if (getStatusAt(getBusinessCalendar(), new Date()).state === "closed") return "今日はお休みにゃ。ぼくはお昼寝中……zzz";
  return visited ? "また来たにゃ。見つけるのが上手だにゃ。" : "にゃ。店長のスヌーです。よく見つけたにゃ。";
}

// 入力欄でのタイピングは合言葉として数えない
function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

export default function SnooEasterEgg() {
  const [visible, setVisible] = useState(false);
  const [line, setLine] = useState("");
  const [tailUp, setTailUp] = useState(false);
  const lineIndex = useRef(0);

  const summon = useCallback(() => {
    setLine(greeting());
    lineIndex.current = 0;
    setVisible(true);
  }, []);

  // 呼び出し: キーボードの合言葉 / ロゴタイプの連続タップ
  useEffect(() => {
    let typed: string[] = [];
    let taps: number[] = [];

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setVisible(false);
        return;
      }
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      typed = [...typed, event.key.length === 1 ? event.key.toLowerCase() : event.key].slice(-KONAMI.length);
      const recent = typed.join("");
      if (recent.endsWith(SNOO_WORD) || typed.join(",") === KONAMI.join(",")) {
        typed = [];
        summon();
      }
    };

    const onClick = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest("[data-snoo-trigger]")) return;
      const now = Date.now();
      taps = [...taps.filter((time) => now - time < TAP_WINDOW_MS), now];
      if (taps.length >= TAP_COUNT) {
        taps = [];
        summon();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
    };
  }, [summon]);

  // しっぽを振る（動きを減らす設定のときは振らない）
  useEffect(() => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setTailUp((up) => !up), 450);
    return () => clearInterval(timer);
  }, [visible]);

  // 開発者ツールをのぞいた人へのあいさつ
  useEffect(() => {
    console.log(
      "%c85-Store%c\nのぞいてくれてありがとうにゃ。キーボードで「snoo」と打つと、店長が見回りに来ます。",
      "font: 800 28px sans-serif; letter-spacing: -1px;",
      "font: 14px sans-serif;"
    );
  }, []);

  if (!visible) return null;

  const talk = () => {
    setLine(LINES[lineIndex.current % LINES.length]);
    lineIndex.current += 1;
  };

  return (
    <div className="snoo-egg fixed right-3 bottom-0 z-[60] flex flex-col items-end gap-2 sm:right-6">
      <div role="status" className="relative max-w-64 border border-ink bg-bg px-4 py-3 text-sm shadow-[4px_4px_0_var(--color-ink)]">
        <p>{line}</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <button type="button" onClick={() => applyTheme("cat")} className="text-xs underline underline-offset-4">
            猫モードにする
          </button>
          <button type="button" onClick={() => setVisible(false)} className="grid h-8 w-8 place-items-center text-lg leading-none" aria-label="スヌーを帰す">
            ×
          </button>
        </div>
      </div>
      <button type="button" onClick={talk} className="block cursor-pointer" aria-label="スヌーをなでる">
        {/* ドット絵は拡大してもぼやけないように表示する */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tailUp ? "/headersnoo2.png" : "/headersnoo.png"}
          alt=""
          width={218}
          height={160}
          className="h-auto w-36 [image-rendering:pixelated] sm:w-44"
        />
      </button>
    </div>
  );
}
