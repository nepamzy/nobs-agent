import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getServerLanguage, translateFields } from "@/lib/translate-content";
import { CareersContent } from "@/components/sections/careers-content";

export const metadata: Metadata = {
  title: "Careers",
  description: "Open roles at NOBS AGENT.",
  alternates: {
    canonical: "/careers",
  },
};

async function getOpenRoles() {
  try {
    const jobs = await prisma.job.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    });
    return jobs.map((job) => ({
      ...job,
      applicantCount: job._count.applications,
    }));
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
