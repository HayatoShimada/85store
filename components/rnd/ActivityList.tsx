import Phrase from "@/components/Phrase";
import type { GithubActivity } from "@/lib/rnd";
import { formatDate } from "@/utils/date";

// 公開リポジトリの PR・Issue（GitHub へのリンク）
const STATE_LABEL: Record<string, string> = { open: "Open", closed: "Closed", merged: "Merged" };

export default function ActivityList({ items }: { items: GithubActivity[] }) {
  return (
    <ul className="border-t border-ink">
      {items.map((item) => (
        <li key={item.url} className="border-b border-rule">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="group block py-3">
            <span className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className={`chip ${item.state === "open" ? "border-ink text-ink" : ""}`}>{STATE_LABEL[item.state] ?? item.state}</span>
              <span className="font-display">{item.repo} #{item.number}</span>
              <time dateTime={item.updatedAt}>{formatDate(item.updatedAt)}</time>
            </span>
            <span className="block text-sm leading-snug group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
              <Phrase>{item.title}</Phrase>
            </span>
            <span className="sr-only"><Phrase>{"（別のサイトで開きます）"}</Phrase></span>
          </a>
        </li>
      ))}
    </ul>
  );
}
