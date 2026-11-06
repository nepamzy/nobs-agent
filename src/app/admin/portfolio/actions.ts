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

// Ensures the slug is actually unique before we hit the database, so a
// duplicate/similar title never crashes the save with a raw Prisma error.
// excludeId lets an update skip past the project's own existing slug.
async function uniqueSlug(base: string, excludeId?: string) {
  let candidate = base || "project";
  let suffix = 2;
  while (
    await prisma.project.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function friendlyDbErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  ) {
    return "A project with that slug already exists. Try a different title or set a custom slug.";
  }
  return err instanceof Error ? err.message : "Something went wrong saving the project.";
}

export type ProjectFormState = { error: string } | undefined;

function splitList(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

// z.url() requires a scheme, but an admin typing a live/GitHub link very
// often just types "example.com" or "github.com/x/y" — without this,
// that's a silent-looking crash (see the comment on createProject below),
// not a validation message anyone would expect for a URL that obviously
// works in a browser. Assume https when no scheme is given, same as
// typing it into an address bar.
function withScheme(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// Every field below is optional (including title) — the admin asked to be
// able to save a project with whatever's filled in right now and come
// back to fill in the rest later, with nothing blocking the save. The
// underlying DB columns (title, summary, industry, problem, solution,
// results) aren't nullable, so createProject/updateProject default an
// empty title to "Untitled project" (it anchors the slug and the public
// page's <title>) and leave the rest as empty strings — a blank section
// on the detail page, not a blocked save.
const projectSchema = z.object({
  title: z.string().trim().optional().or(z.literal("")),
  summary: z.string().trim().optional().or(z.literal("")),
  industry: z.string().trim().optional().or(z.literal("")),
  problem: z.string().trim().optional().or(z.literal("")),
  solution: z.string().trim().optional().or(z.literal("")),
  results: z.string().trim().optional().or(z.literal("")),
  constraints: z.string().trim().optional().or(z.literal("")),
  architecture: z.string().trim().optional().or(z.literal("")),
  keyEngineeringDecisions: z.string().trim().optional().or(z.literal("")),
  security: z.string().trim().optional().or(z.literal("")),
  performance: z.string().trim().optional().or(z.literal("")),
  durationWeeks: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().int().positive().optional()
  ),
  liveUrl: z.preprocess(withScheme, z.string().trim().url().optional().or(z.literal(""))),
  githubUrl: z.preprocess(withScheme, z.string().trim().url().optional().or(z.literal(""))),
  coverImage: z.string().trim().optional().or(z.literal("")),
  clientName: z.string().trim().optional().or(z.literal("")),
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

// Bound to the form via useActionState (src/components/admin/project-form.tsx)
// instead of a plain `action={createProject}` — that older binding had no
// way to surface a thrown error: any validation failure or DB error (a
// duplicate slug, a bad URL, anything) crashed straight to Next.js's
// generic error screen with no indication of what was wrong or how to fix
// it, which from the admin's seat just looked like "I can't add a
// project." Returning `{ error }` instead of throwing lets the form show
// the real reason inline and keep whatever the admin already typed.
export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  await requireAdmin();

  const parsed = projectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { clientName, ...data } = parsed.data;
  const title = data.title || "Untitled project";
  const slug = await uniqueSlug(slugify(String(formData.get("slug") || title)));
  const clientId = await resolveClientId(clientName);

  try {
    await prisma.project.create({
      data: {
        ...data,
        slug,
        title,
        summary: data.summary || "",
        industry: data.industry || "",
        problem: data.problem || "",
        solution: data.solution || "",
        results: data.results || "",
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
        nda: formData.get("nda") === "on",
        clientId,
      },
    });
  } catch (err) {
    return { error: friendlyDbErrorMessage(err) };
  }

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${slug}`);
  revalidatePath("/case-studies");
  redirect("/admin/portfolio");
}

export async function updateProject(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing project id." };

  const parsed = projectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { clientName, ...data } = parsed.data;
  const clientId = await resolveClientId(clientName);

  let updated;
  try {
    updated = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        title: data.title || "Untitled project",
        summary: data.summary || "",
        industry: data.industry || "",
        problem: data.problem || "",
        solution: data.solution || "",
        results: data.results || "",
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
        nda: formData.get("nda") === "on",
        ...(clientId ? { clientId } : {}),
      },
    });
  } catch (err) {
    return { error: friendlyDbErrorMessage(err) };
  }

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
