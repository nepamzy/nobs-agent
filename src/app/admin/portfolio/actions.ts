"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }
  return session;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function splitList(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

const projectSchema = z.object({
  title: z.string().trim().min(2).max(150),
  summary: z.string().trim().min(2).max(300),
  industry: z.string().trim().min(2).max(100),
  problem: z.string().trim().min(2),
  solution: z.string().trim().min(2),
  results: z.string().trim().min(2),
  constraints: z.string().trim().optional().or(z.literal("")),
  architecture: z.string().trim().optional().or(z.literal("")),
  keyEngineeringDecisions: z.string().trim().optional().or(z.literal("")),
  security: z.string().trim().optional().or(z.literal("")),
  performance: z.string().trim().optional().or(z.literal("")),
  durationWeeks: z.coerce.number().int().positive().optional(),
  liveUrl: z.string().trim().url().optional().or(z.literal("")),
  githubUrl: z.string().trim().url().optional().or(z.literal("")),
  coverImage: z.string().trim().optional().or(z.literal("")),
  clientName: z.string().trim().max(150).optional().or(z.literal("")),
});

// Upserts a Client by name so uploading a project is the only step needed,
// the client automatically shows up on /clients without a second manual
// step in a different admin screen.
async function resolveClientId(clientName: string | undefined) {
  if (!clientName) return null;
  const existing = await prisma.client.findFirst({ where: { name: clientName } });
  if (existing) return existing.id;
  const created = await prisma.client.create({ data: { name: clientName } });
  revalidatePath("/clients");
  return created.id;
}

export async function createProject(formData: FormData) {
  await requireAdmin();

  const parsed = projectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const { clientName, ...data } = parsed.data;
  const slug = slugify(String(formData.get("slug") || data.title));
  const clientId = await resolveClientId(clientName);

  await prisma.project.create({
    data: {
      ...data,
      slug,
      coverImage: data.coverImage || "",
      liveUrl: data.liveUrl || null,
      githubUrl: data.githubUrl || null,
      constraints: data.constraints || null,
      architecture: data.architecture || null,
      keyEngineeringDecisions: data.keyEngineeringDecisions || null,
      security: data.security || null,
      performance: data.performance || null,
      technologies: splitList(formData.get("technologies")),
      gallery: formData.getAll("gallery").map(String).filter(Boolean),
      featured: formData.get("featured") === "on",
      hidden: formData.get("hidden") === "on",
      clientId,
    },
  });

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${slug}`);
  revalidatePath("/case-studies");
  redirect("/admin/portfolio");
}

export async function updateProject(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Missing project id.");

  const parsed = projectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const { clientName, ...data } = parsed.data;
  const clientId = await resolveClientId(clientName);

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...data,
      coverImage: data.coverImage || "",
      liveUrl: data.liveUrl || null,
      githubUrl: data.githubUrl || null,
      constraints: data.constraints || null,
      architecture: data.architecture || null,
      keyEngineeringDecisions: data.keyEngineeringDecisions || null,
      security: data.security || null,
      performance: data.performance || null,
      technologies: splitList(formData.get("technologies")),
      gallery: formData.getAll("gallery").map(String).filter(Boolean),
      featured: formData.get("featured") === "on",
      hidden: formData.get("hidden") === "on",
      ...(clientId ? { clientId } : {}),
    },
  });

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${updated.slug}`);
  revalidatePath("/case-studies");
  redirect("/admin/portfolio");
}

export async function deleteProject(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Missing project id.");

  const deleted = await prisma.project.delete({ where: { id } });
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${deleted.slug}`);
  revalidatePath("/case-studies");
}

export async function toggleFeatured(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  const featured = formData.get("featured") === "true";
  if (typeof id !== "string") throw new Error("Missing project id.");

  await prisma.project.update({ where: { id }, data: { featured: !featured } });
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/case-studies");
}

export async function toggleHidden(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  const hidden = formData.get("hidden") === "true";
  if (typeof id !== "string") throw new Error("Missing project id.");

  const toggled = await prisma.project.update({ where: { id }, data: { hidden: !hidden } });
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${toggled.slug}`);
  revalidatePath("/case-studies");
}

export async function addProjectFile(formData: FormData) {
  const session = await requireAdmin();

  const projectId = formData.get("projectId");
  const url = formData.get("url");
  const fileName = formData.get("fileName");
  if (typeof projectId !== "string" || typeof url !== "string" || typeof fileName !== "string") {
    throw new Error("Missing file data.");
  }

  await prisma.projectFile.create({
    data: { projectId, url, fileName, uploadedByRole: session.user.role },
  });

  revalidatePath(`/admin/portfolio/${projectId}/edit`);
  revalidatePath("/dashboard");
}

export async function deleteProjectFile(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");
  const projectId = formData.get("projectId");
  if (typeof id !== "string" || typeof projectId !== "string") {
    throw new Error("Missing file id.");
  }

  await prisma.projectFile.delete({ where: { id } });
  revalidatePath(`/admin/portfolio/${projectId}/edit`);
  revalidatePath("/dashboard");
}
