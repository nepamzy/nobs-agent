"use client";

import { useState } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/data/blog";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type Filter = "all" | "article" | "build_log";

export function BlogListing({ posts }: { posts: BlogPost[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const hasBuildLogs = posts.some((p) => p.postType === "build_log");

  const visible = posts.filter((p) => filter === "all" || p.postType === filter);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {hasBuildLogs && (
        <div className="mb-8 flex gap-2">
          {(
            [
              ["all", "All"],
              ["article", "Articles"],
              ["build_log", "Build Logs"],
            ] as [Filter, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                filter === value
                  ? "border-[var(--color-brass)] text-[var(--color-brass)]"
                  : "border-[var(--color-line)] text-[var(--color-slate)] hover:border-[var(--color-brass)]/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="divide-y divide-[var(--color-line)]">
        {visible.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block py-8">
            <p className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
              {post.postType === "build_log" && (
                <span className="rounded-full border border-[var(--color-brass)]/50 px-2 py-0.5">
                  Build Log
                </span>
              )}
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
