'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/lib/toc';

interface TableOfContentsProps {
  headings: TocItem[];
}

// 見出しデータはサーバーで抽出済み（SSRで描画されるためレイアウトシフトが起きない）
export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? '');

  // スクロール位置に応じてアクティブな見出しを更新
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveId(headings[i].id);
            return;
          }
        }
      }

      if (headings.length > 0) {
        setActiveId(headings[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // ヘッダーの高さ分オフセット
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav aria-labelledby="toc-heading" className="mb-12 border-t border-ink pt-4">
      <h2 id="toc-heading" className="mb-3 font-display text-sm font-semibold tracking-wide">
        Contents<span className="ml-2 font-sans font-normal text-muted">目次</span>
      </h2>
      <ol className="grid gap-2 border-b border-rule pb-4">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "pl-4" : undefined}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              aria-current={activeId === heading.id ? "location" : undefined}
              className="block text-sm leading-relaxed text-ink-2 hover:underline hover:underline-offset-4 aria-[current=location]:font-semibold aria-[current=location]:text-ink"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
