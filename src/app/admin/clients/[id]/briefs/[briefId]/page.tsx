import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateClientBrief, deleteClientBrief } from "../actions";
import { BriefForm, type BriefAnswer } from "@/components/admin/brief-form";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { ArrowLeft, Trash2 } from "lucide-react";

export default async function ClientBriefPage({
  params,
}: {
  params: Promise<{ id: string; briefId: string }>;
}) {
  const { id, briefId } = await params;

  let client, brief;
  try {
    [client, brief] = await Promise.all([
      prisma.client.findUnique({ where: { id } }),
      prisma.clientBrief.findUnique({ where: { id: briefId } }),
    ]);
  } catch {
    client = null;
    brief = null;
  }
  if (!client || !brief || brief.clientId !== id) notFound();

  return (
    <div>
      <Link
        href={`/admin/clients/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
      >
        <ArrowLeft size={15} /> Back to {client.name}
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
            {brief.packageName} <span className="text-[var(--color-slate)]">&middot; {client.name}</span>
          </h1>
          <p className="mt-1 text-xs text-[var(--color-slate)]">
            Filled {new Date(brief.createdAt).toLocaleDateString()}
            {brief.updatedAt > brief.createdAt
              ? `, last updated ${new Date(brief.updatedAt).toLocaleDateString()}`
              : ""}
            {brief.createdBy ? ` by ${brief.createdBy}` : ""}
          </p>
        </div>
        <form action={deleteClientBrief}>
          <input type="hidden" name="briefId" value={brief.id} />
          <input type="hidden" name="clientId" value={id} />
          <ConfirmSubmit
            message="Delete this brief? This can't be undone."
            title="Delete brief"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs transition hover:border-red-500/50 hover:text-red-400"
          >
            <Trash2 size={14} /> Delete
          </ConfirmSubmit>
        </form>
      </div>

      <div className="mt-6">
        <BriefForm
          clientId={id}
          briefId={brief.id}
          initialPackageKey={brief.packageKey}
          initialAnswers={brief.answers as unknown as BriefAnswer[]}
          action={updateClientBrief}
        />
      </div>
    </div>
  );
}
