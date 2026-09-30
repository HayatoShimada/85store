"use client";

import { useSyncExternalStore } from "react";
import { THEMES, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

function ThemeIcon({ theme }: { theme: Theme }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  if (theme === "light") {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
      </svg>
    );
  }
  if (theme === "dark") {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
      </svg>
    );
  }
  // 猫: 肉球
  return (
    <svg {...common} fill="currentColor">
      <ellipse cx="12" cy="16" rx="5" ry="4.2" />
      <ellipse cx="5.5" cy="10.5" rx="2" ry="2.6" />
      <ellipse cx="9.5" cy="6.5" rx="2" ry="2.7" />
      <ellipse cx="14.5" cy="6.5" rx="2" ry="2.7" />
      <ellipse cx="18.5" cy="10.5" rx="2" ry="2.6" />
    </svg>
  );
}

// <html data-theme> を唯一の状態として扱い、変化を購読する
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const getTheme = () => (document.documentElement.dataset.theme as Theme | undefined) ?? "light";
// サーバーでは保存値がわからないので未選択として描画する
const getServerTheme = () => null;

function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // プライベートブラウズなどで保存できなくても、表示は切り替える
  }
}

// ヘッダーの表示モード切り替え（ライト / ダーク / 猫）
export default function ThemeSwitcher() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  return (
    <div role="group" aria-label="表示モード" className="flex border border-rule">
      {THEMES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => applyTheme(value)}
          aria-pressed={theme === value}
          aria-label={`${label}モード`}
          title={`${label}モード`}
          className="grid h-11 w-11 place-items-center text-muted transition-colors hover:text-ink aria-pressed:bg-ink aria-pressed:text-bg max-[380px]:w-9"
        >
          <ThemeIcon theme={value} />
        </button>
      ))}
    </div>
  );
}
