import { STORE } from "@/lib/store-info";

import Phrase from "@/components/Phrase";
// 営業時間の変更や急なお休みのお知らせ先（Instagram）への案内
export default function IrregularHolidayNote({ className = "" }: { className?: string }) {
  return (
    <span className={`block text-sm ${className}`}>
      <Phrase>{"営業時間の変更や急なお休みは"}</Phrase>
      <a href={STORE.sns.instagram} target="_blank" rel="noopener noreferrer" className="mx-0.5 underline underline-offset-4">
        Instagram
      </a>
      <Phrase>{"のストーリーでお知らせします"}</Phrase>
    </span>
  );
}
