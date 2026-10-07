import { STORE } from "@/lib/store-info";

import Phrase from "@/components/Phrase";
interface StoreActionsProps {
  variant?: "default" | "inverse"; // inverse は深緑の面の上で使う
  showOnlineStore?: boolean;
  leading?: React.ReactNode; // 先頭に並べる追加のボタン
}

// 「オンラインストア / 地図を開く / 駐車場」のボタン群
export default function StoreActions({ variant = "default", showOnlineStore = true, leading }: StoreActionsProps) {
  const sub = variant === "inverse" ? "btn btn-inverse" : "btn btn-secondary";

  return (
    <div className="flex flex-wrap gap-2">
      {leading}
      {showOnlineStore && (
        <a href={STORE.onlineShopUrl} className={variant === "inverse" ? sub : "btn btn-primary"}>
          <Phrase>{"オンラインストア"}</Phrase>
        </a>
      )}
      <a href={STORE.mapUrl} target="_blank" rel="noopener noreferrer" className={sub}>
        <Phrase>{"地図を開く"}</Phrase>
      </a>
      <a href={STORE.parkingUrl} target="_blank" rel="noopener noreferrer" className={sub}>
        <Phrase>{"駐車場"}</Phrase>
      </a>
    </div>
  );
}
