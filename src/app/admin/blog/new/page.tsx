import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { createPost } from "../actions";

export default function NewPostPage() {
  return (
    <div>
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
      >
        <ArrowLeft size={15} /> Back to blog
      </Link>
      <h1 className="mt-4 mb-6 font-[family-name:var(--font-display)] text-2xl font-medium">
        New post
      </h1>
      <BlogPostForm action={createPost} />
    </div>
  );
}
