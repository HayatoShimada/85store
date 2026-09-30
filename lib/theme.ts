// 表示モード（テーマ）。<html data-theme="..."> で切り替え、色は app/globals.css で定義する
export const THEMES = [
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
  { value: "cat", label: "猫" },
] as const;

export type Theme = (typeof THEMES)[number]["value"];

export const THEME_STORAGE_KEY = "85store-theme";

// 最初の描画より前に実行し、保存したテーマ（なければOSのダークモード設定）を反映する。
// React の描画後に切り替えると一瞬ちがう色が見えるため、<head> のインラインスクリプトで行う
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"&&t!=="cat"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})()`;

// テーマを切り替えて保存する（ブラウザでのみ呼ぶ）
export function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // プライベートブラウズなどで保存できなくても、表示は切り替える
  }
}
