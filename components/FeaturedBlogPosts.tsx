import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import { BlogPost } from "@/types/notion";

interface FeaturedBlogPostsProps {
  posts: BlogPost[];
}

export default function FeaturedBlogPosts({ posts }: FeaturedBlogPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="section-padding max-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Featured Posts
          </h2>
          <p className="text-gray-600">
            おすすめのブログ記事
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/blog" className="btn-primary">
            すべての記事を見る
          </Link>
        </div>
      </div>
    </section>
  );
}

