import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getBlogPosts } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on building institutional platforms, commerce systems, and product engineering.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div>
      <PageHeader eyebrow="Blog" title="Notes from the build" />

      <div className="mx-auto max-w-3xl divide-y divide-[var(--color-line)] px-6 py-16">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block py-8">
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
              {post.category} · {formatDate(post.publishedAt)}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-medium transition group-hover:text-[var(--color-brass)]">
              {post.title}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-slate)]">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
