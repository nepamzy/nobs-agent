import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAllBlogSlugs, getBlogPostBySlug } from "@/lib/data/blog";
import { getServerLanguage, translateFields, translateList } from "@/lib/translate-content";

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const language = await getServerLanguage();
  const { title } = await translateFields({ title: post.title }, language);
  const content = await translateList(post.content, language);

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
      >
        <ArrowLeft size={15} /> Back to blog
      </Link>

      <p className="mt-8 flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        {post.postType === "build_log" && (
          <span className="rounded-full border border-[var(--color-brass)]/50 px-2 py-0.5">
            Build Log
          </span>
        )}
        {post.category} · {formatDate(post.publishedAt)}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight sm:text-4xl">
        {title}
      </h1>

      <div className="mt-8 space-y-5 text-[var(--color-slate)]">
        {content.map((para, i) => (
          <p key={i} className="leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
