import BlogSectionPage, { blogSectionMetadata } from "@/components/BlogSectionPage";

export const metadata = blogSectionMetadata("products");

export default function Page() {
  return <BlogSectionPage slug="products" />;
}
