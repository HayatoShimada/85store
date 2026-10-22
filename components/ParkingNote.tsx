import { STORE } from "@/lib/store-info";

import Phrase from "@/components/Phrase";
// おすすめの駐車場の案内（地図へのリンク付き）
export default function ParkingNote({ className = "" }: { className?: string }) {
  return (
    <span className={`text-sm ${className}`}>
      {STORE.parkingNote}
      <a href={STORE.parkingUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline underline-offset-4">
        <Phrase>{"駐車場の地図"}</Phrase>
      </a>
    </span>
  );
}
