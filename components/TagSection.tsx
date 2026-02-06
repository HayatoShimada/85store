import Link from 'next/link';

interface TagSectionProps {
  tags: string[];
  inline?: boolean;
}

export function TagSection({ tags, inline = false }: TagSectionProps) {
  // タグが空の場合は何も表示しない
  if (!tags || tags.length === 0) {
    return null;
  }

  // インラインモード（控えめなデザイン）
  if (inline) {
    return (
      <div className="flex flex-wrap justify-center gap-2">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/blog/tag/${encodeURIComponent(tag)}`}
            className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            #{tag}
          </Link>
        ))}
      </div>
    );
  }

  // 通常モード（フルセクション）
  return (
    <section className="py-16">
      <div className="section-padding max-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary mb-4">
            Tags
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${encodeURIComponent(tag)}`}
              className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-primary hover:text-white transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
