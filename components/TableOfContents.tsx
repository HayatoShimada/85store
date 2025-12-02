'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  html: string;
}

// HTMLから見出しを抽出する関数
function extractHeadings(html: string): TocItem[] {
  const headings: TocItem[] = [];
  // h2とh3を抽出
  const regex = /<h([23])[^>]*id="([^"]*)"[^>]*>([^<]*)<\/h[23]>|<h([23])[^>]*>([^<]*)<\/h[23]>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1] || match[4]);
    const id = match[2] || '';
    const text = (match[3] || match[5] || '').trim();

    if (text) {
      // IDがない場合は生成
      const generatedId = id || text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/gi, '');
      headings.push({
        id: generatedId,
        text,
        level,
      });
    }
  }

  return headings;
}

// コンテンツにIDを付与するためのHTML変換
export function addHeadingIds(html: string): string {
  let counter = 0;
  return html.replace(/<h([23])([^>]*)>([^<]*)<\/h[23]>/gi, (match, level, attrs, text) => {
    // 既存のIDがあればそのまま
    if (attrs.includes('id="')) {
      return match;
    }
    const id = `heading-${counter++}`;
    return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
  });
}

export function TableOfContents({ html }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // DOM上の見出し要素から抽出
    const elements = document.querySelectorAll('h2, h3');
    const items: TocItem[] = [];

    elements.forEach((el, index) => {
      const text = el.textContent?.trim() || '';
      if (text) {
        // IDがなければ付与
        if (!el.id) {
          el.id = `heading-${index}`;
        }
        items.push({
          id: el.id,
          text,
          level: el.tagName === 'H2' ? 2 : 3,
        });
      }
    });

    setHeadings(items);
  }, [html]);

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

    window.addEventListener('scroll', handleScroll);
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
    <nav className="bg-gray-50 rounded-lg p-4 md:p-6 mb-8">
      <h2 className="text-lg font-bold text-secondary mb-4">目次</h2>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={heading.level === 3 ? 'pl-4' : ''}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={`block text-sm transition-colors hover:text-primary ${
                activeId === heading.id
                  ? 'text-primary font-medium'
                  : 'text-gray-600'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
