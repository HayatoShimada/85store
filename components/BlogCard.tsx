import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/types/notion";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:shadow-xl hover:-translate-y-1">
        {post.coverImage && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <span>{new Date(post.date).toLocaleDateString('ja-JP')}</span>
            <span className="text-primary">{post.category}</span>
          </div>
          <h3 className="text-xl font-semibold text-secondary mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}