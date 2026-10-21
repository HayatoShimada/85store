import FallbackImage from "@/components/FallbackImage";
import { formatDate } from "@/utils/date";
import type { NoteArticle } from "@/lib/note";

import Phrase from "@/components/Phrase";
interface NoteCardProps {
  article: NoteArticle;
}

// note.com の記事カード（外部リンク）
export default function NoteCard({ article }: NoteCardProps) {
  return (
    <li>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group grid gap-3 max-[560px]:grid-cols-[112px_minmax(0,1fr)] max-[560px]:items-start max-[560px]:gap-4"
      >
        <div className="media-frame aspect-[16/9] max-[560px]:aspect-square">
          <FallbackImage
            src={article.thumbnail}
            alt=""
            fill
            sizes="(max-width: 560px) 112px, (max-width: 900px) 50vw, 33vw"
            unoptimized={article.thumbnail?.includes("st-note.com")}
          />
        </div>
        <div>
          <p className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
            <time dateTime={article.publishedAt} className="num">{formatDate(article.publishedAt)}</time>
            <span className="chip">note</span>
          </p>
          <h3 className="text-lg leading-normal group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[5px] max-[560px]:text-base">
            <Phrase>{article.title}</Phrase>
            <span className="sr-only">（note.com で開きます）</span>
          </h3>
        </div>
      </a>
    </li>
  );
}
