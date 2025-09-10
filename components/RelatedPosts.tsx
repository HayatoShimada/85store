'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types/notion';
import { getCategoryStyleClasses } from '@/utils/notionColors';

interface RelatedPostsProps {
  posts: BlogPost[];
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
          <p className="text-gray-600">
            You might also be interested in these articles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => {
            const isNotionImage = post.coverImage && (
              post.coverImage.includes('prod-files-secure.s3.us-west-2.amazonaws.com') ||
              post.coverImage.includes('s3.us-west-2.amazonaws.com') ||
              post.coverImage.includes('s3.amazonaws.com')
            );
            
            const processedImageUrl = isNotionImage && post.coverImage 
              ? `/api/image-proxy?url=${encodeURIComponent(post.coverImage)}` 
              : (post.coverImage || '/images/placeholder.svg');

            return (
              <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative h-48 w-full">
                    <Image
                      src={processedImageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.categoryColors && post.categoryColors.length > 0 && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryStyleClasses(post.categoryColors)}`}>
                          {post.category}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                      {post.author && (
                        <span>by {post.author}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
