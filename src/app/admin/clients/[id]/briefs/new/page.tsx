import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClientBrief } from "../actions";
import { BriefForm } from "@/components/admin/brief-form";
import { ArrowLeft } from "lucide-react";

export default async function NewClientBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let client;
  try {
    client = await prisma.client.findUnique({ where: { id } });
  } catch {
    client = null;
  }
  if (!client) notFound();

  return (
    <div>
      <Link
        href={`/admin/clients/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
      >
        <ArrowLeft size={15} /> Back to {client.name}
      </Link>

      <h1 className="mt-4 mb-6 font-[family-name:var(--font-display)] text-2xl font-medium">
        New brief for {client.name}
      </h1>

      <BriefForm clientId={id} action={createClientBrief} />
    </div>
  );
}
