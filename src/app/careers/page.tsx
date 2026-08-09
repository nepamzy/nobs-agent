import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getServerLanguage, translateFields } from "@/lib/translate-content";
import { CareersContent } from "@/components/sections/careers-content";

export const metadata: Metadata = {
  title: "Careers",
  description: "Open roles at NOBS AGENT.",
};

async function getOpenRoles() {
  try {
    return await prisma.job.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export default async function CareersPage() {
  const roles = await getOpenRoles();
  const language = await getServerLanguage();

  const translated = await Promise.all(
    roles.map(async (role) => {
      const { title } = await translateFields({ title: role.title }, language);
      return { ...role, title };
    })
  );

  return <CareersContent roles={translated} />;
}
