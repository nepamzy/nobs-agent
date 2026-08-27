import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { BlogListing } from "@/components/blog-listing";
import { getBlogPosts } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on building institutional platforms, commerce systems, and product engineering, plus build logs from real projects.",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div>
      <PageHeader eyebrow="Blog" title="Notes from the build" />
      <BlogListing posts={posts} />
    </div>
  );
}
