"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fallbackPosts } from "@/lib/data/blog";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const postSchema = z.object({
  title: z.string().trim().min(2).max(200),
  excerpt: z.string().trim().min(2).max(300),
  content: z.string().trim().min(10),
  category: z.string().trim().max(100).optional().or(z.literal("")),
  postType: z.enum(["ARTICLE", "BUILD_LOG"]).default("ARTICLE"),
  coverImage: z.string().trim().max(500).optional().or(z.literal("")),
  metaTitle: z.string().trim().max(200).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(300).optional().or(z.literal("")),
});

export async function createPost(formData: FormData) {
  await requireAdmin();

  const parsed = postSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const data = parsed.data;
  const slug = slugify(String(formData.get("slug") || data.title));
  const published = formData.get("published") === "on";

  await prisma.blogPost.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category || null,
      postType: data.postType,
      coverImage: data.coverImage || null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      published,
      publishedAt: published ? new Date() : null,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function updatePost(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Missing post id.");

  const parsed = postSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const data = parsed.data;
  const published = formData.get("published") === "on";

  const existing = await prisma.blogPost.findUnique({ where: { id } });

  await prisma.blogPost.update({
    where: { id },
    data: {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category || null,
      postType: data.postType,
      coverImage: data.coverImage || null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      published,
      // Only stamp publishedAt the first time a post goes live, so
      // re-saving an already-published post doesn't bump its date.
      publishedAt: published ? (existing?.publishedAt ?? new Date()) : null,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Missing post id.");

  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

// The public /blog page falls back to these same 14 sample articles
// (src/lib/data/blog.ts) whenever the real table is empty, so a site with
// zero authored posts still looks presentable. This turns them into real,
// editable/deletable rows — safe to click more than once: skipDuplicates
// means an already-imported post (matched by its slug) is left untouched,
// never overwriting edits made to it since.
export async function importFallbackPosts() {
  await requireAdmin();

  await prisma.blogPost.createMany({
    data: fallbackPosts.map((p) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content.join("\n\n"),
      category: p.category,
      postType: p.postType === "build_log" ? "BUILD_LOG" : "ARTICLE",
      published: true,
      publishedAt: new Date(p.publishedAt),
    })),
    skipDuplicates: true,
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function togglePublished(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  const published = formData.get("published") === "true";
  if (typeof id !== "string") throw new Error("Missing post id.");

  const existing = await prisma.blogPost.findUnique({ where: { id } });

  await prisma.blogPost.update({
    where: { id },
    data: {
      published: !published,
      publishedAt: !published ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
