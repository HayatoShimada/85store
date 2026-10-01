import { STORE } from "@/lib/store-info";

// 営業時間の変更や急なお休みのお知らせ先（Instagram）への案内
export default function IrregularHolidayNote({ className = "" }: { className?: string }) {
  return (
    <span className={`block text-sm ${className}`}>
      営業時間の変更や急なお休みは
      <a href={STORE.sns.instagram} target="_blank" rel="noopener noreferrer" className="mx-0.5 underline underline-offset-4">
        Instagram
      </a>
      のストーリーでお知らせします
    </span>
  );
}
