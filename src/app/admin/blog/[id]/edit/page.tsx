import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { updatePost } from "../../actions";
import { prisma } from "@/lib/prisma";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let post;
  try {
    post = await prisma.blogPost.findUnique({ where: { id } });
  } catch {
    post = null;
  }

  if (!post) notFound();

  return (
    <div>
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
      >
        <ArrowLeft size={15} /> Back to blog
      </Link>
      <h1 className="mt-4 mb-6 font-[family-name:var(--font-display)] text-2xl font-medium">
        Edit post
      </h1>
      <BlogPostForm action={updatePost} defaultValues={post} />
    </div>
  );
}
