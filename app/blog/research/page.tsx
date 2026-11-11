import BlogSectionPage, { blogSectionMetadata } from "@/components/BlogSectionPage";

export const metadata = blogSectionMetadata("research");

export default function Page() {
  return <BlogSectionPage slug="research" />;
}
