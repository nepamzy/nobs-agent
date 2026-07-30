"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const commentSchema = z.object({
  projectId: z.string().min(1),
  body: z.string().trim().min(1).max(3000),
});

export async function postProjectComment(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Not authorized.");

  const parsed = commentSchema.safeParse({
    projectId: formData.get("projectId"),
    body: formData.get("body"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const { projectId, body } = parsed.data;

  // Ownership check: a client can only post to a project that's actually
  // theirs, or an admin can post to any project.
  if (session.user.role === "CLIENT") {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.clientUserId !== session.user.id) {
      throw new Error("Not authorized.");
    }
  }

  await prisma.message.create({
    data: { senderId: session.user.id, projectId, body },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/admin/portfolio/${projectId}/edit`);
}

const fileSchema = z.object({
  projectId: z.string().min(1),
  url: z.string().trim().url(),
  fileName: z.string().trim().min(1).max(200),
});

export async function uploadClientFile(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Not authorized.");

  const parsed = fileSchema.safeParse({
    projectId: formData.get("projectId"),
    url: formData.get("url"),
    fileName: formData.get("fileName"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const { projectId, url, fileName } = parsed.data;

  // Same ownership check as comments, a client can only attach files to
  // their own project.
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || (session.user.role === "CLIENT" && project.clientUserId !== session.user.id)) {
    throw new Error("Not authorized.");
  }

  await prisma.projectFile.create({
    data: { projectId, url, fileName, uploadedByRole: session.user.role },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/admin/portfolio/${projectId}/edit`);
}
