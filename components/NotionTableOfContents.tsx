import React from "react";
import Link from "next/link";

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

interface NotionTableOfContentsProps {
  blocks: any[];
}

export function NotionTableOfContents({ blocks }: NotionTableOfContentsProps) {
  const headings: TableOfContentsItem[] = [];

  // ブロックから見出しを抽出
  blocks.forEach((block) => {
    const { type, id } = block;
    const value = block[type];

    if (type === "heading_1" || type === "heading_2" || type === "heading_3") {
      const text = value.rich_text?.map((text: any) => text.text.content).join("") || "";
      const level = type === "heading_1" ? 1 : type === "heading_2" ? 2 : 3;
      
      if (text) {
        headings.push({
          id: id,
          text: text,
          level: level,
        });
      }
    }
  });

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        Table of Contents
      </h4>
      <nav className="space-y-2">
        {headings.map((heading) => (
          <Link
            key={heading.id}
            href={`#heading-${heading.id}`}
            className={`block text-sm hover:text-primary transition-colors ${
              heading.level === 1 
                ? "font-semibold text-gray-800" 
                : heading.level === 2 
                ? "text-gray-700 ml-4" 
                : "text-gray-600 ml-8"
            }`}
          >
            {heading.text}
          </Link>
        ))}
      </nav>
    </div>
  );
}
