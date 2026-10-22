import Image from "next/image";
import Link from "next/link";
import { isExternalWork, type Work } from "@/lib/works";

import Phrase from "@/components/Phrase";
import { SHORT_TEXT_LENGTH } from "@/lib/phrase";
interface WorkCardProps {
  work: Work;
  sizes?: string;
  showDescription?: boolean;
}

// Works のカード（外部サイトは新しいタブで開く）
export default function WorkCard({
  work,
  sizes = "(max-width: 560px) 100vw, 50vw",
  showDescription = true,
}: WorkCardProps) {
  const external = isExternalWork(work);
  const body = (
    <>
      <div className="media-frame aspect-[4/3]">
        <Image src={work.image} alt="" fill sizes={sizes} />
      </div>
      <div className="p-4">
        <p className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="chip">{work.kind}</span>
          {external && <span>{new URL(work.href).host}</span>}
        </p>
        <h3 className="font-semibold group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[5px]">
          <Phrase>{work.name}</Phrase>
          {external && <span className="sr-only"><Phrase>{"（別のサイトで開きます）"}</Phrase></span>}
        </h3>
        {showDescription && <p className="mt-2 text-sm text-ink-2 leading-relaxed"><Phrase max={SHORT_TEXT_LENGTH}>{work.description}</Phrase></p>}
      </div>
    </>
  );

  return (
    <li>
      {external ? (
        <a href={work.href} target="_blank" rel="noopener noreferrer" className="group block">{body}</a>
      ) : (
        <Link href={work.href} className="group block">{body}</Link>
      )}
    </li>
  );
}
