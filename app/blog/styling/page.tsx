import BlogSectionPage, { blogSectionMetadata } from "@/components/BlogSectionPage";

export const metadata = blogSectionMetadata("styling");

export default function Page() {
  return <BlogSectionPage slug="styling" />;
}
