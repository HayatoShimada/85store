'use client';

import Image from "next/image";
import { useState } from "react";
import type { NoteArticle } from "@/lib/note";

interface NoteCardProps {
  article: NoteArticle;
}

export default function NoteCard({ article }: NoteCardProps) {
  const [imageError, setImageError] = useState(false);

  const displayImageUrl = (!imageError && article.thumbnail)
    ? article.thumbnail
    : '/images/placeholder.svg';

  return (
    <article className="card-acrylic group">
      <a href={article.url} target="_blank" rel="noopener noreferrer">
        <div className="relative h-48 sm:h-52 md:h-48 w-full overflow-hidden bg-gray-100 rounded-t-lg">
          <Image
            src={displayImageUrl}
            alt={article.title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 70vw"
            priority={false}
            quality={75}
            unoptimized={article.thumbnail?.includes('st-note.com')}
          />
          {/* noteバッジ */}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 text-xs px-2 py-1 rounded font-medium flex items-center gap-1 border border-gray-200">
            <svg className="w-3 h-3" viewBox="0 0 493 493" fill="currentColor">
              <path d="m139.57,142.06c41.19,0,97.6-2.09,138.1-1.04,54.34,1.39,74.76,25.06,75.45,83.53.69,33.06,0,127.73,0,127.73h-58.79c0-82.83.35-96.5,0-122.6-.69-22.97-7.25-33.92-24.9-36.01-18.69-2.09-71.07-.35-71.07-.35v158.96h-58.79v-210.22Z"/>
            </svg>
            note
          </div>
        </div>
        <div className="p-6 pb-2">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-300">
              note
            </span>
            <span>{new Date(article.publishedAt).toLocaleDateString('ja-JP')}</span>
          </div>
          <h3 className="text-xl font-semibold text-secondary mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-gray-600 line-clamp-2">{article.excerpt}</p>
          )}
        </div>
        <div className="px-6 pb-4">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            note.comで読む
          </span>
        </div>
      </a>
    </article>
  );
}
