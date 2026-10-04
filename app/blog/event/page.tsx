import BlogSectionPage, { blogSectionMetadata } from "@/components/BlogSectionPage";

export const metadata = blogSectionMetadata("event");

export default function Page() {
  return <BlogSectionPage slug="event" />;
}
