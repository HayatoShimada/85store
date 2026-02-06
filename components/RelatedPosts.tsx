import React from 'react';
import type { Blog } from '@/types/microcms';
import BlogCard from '@/components/BlogCard';

interface RelatedPostsProps {
  posts: Blog[];
  title?: string;
}

export function RelatedPosts({ posts, title = "Related Posts" }: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="section-padding max-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary mb-4">
            {title}
          </h2>
          <p className="text-sm text-gray-600">
            こちらの記事もおすすめです
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

      </div>
    </section>
  );
}
