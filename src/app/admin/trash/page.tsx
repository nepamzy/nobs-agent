import { prisma } from "@/lib/prisma";
import { restoreUserAccountAction } from "@/app/admin/accounts/actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { RotateCcw, Users, Handshake } from "lucide-react";

async function getTrashedUsers() {
  return prisma.user.findMany({
    where: { deletedAt: { not: null } },
    include: {
      client: { select: { id: true, name: true } },
      referralPartner: { select: { id: true, referralCode: true } },
    },
    orderBy: { deletedAt: "desc" },
  });
}

export default async function AdminTrashPage() {
  let users: Awaited<ReturnType<typeof getTrashedUsers>> = [];
  let connected = true;
  try {
    users = await getTrashedUsers();
  } catch {
    connected = false;
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">Trash</h1>
      <p className="mt-1 text-sm text-[var(--color-slate)]">
        Deleted client and referral partner accounts. Restoring gives an account back its
        original email — since the password was invalidated at delete time, they&apos;ll need to
        use &quot;Forgot password&quot; to sign back in.
      </p>

      {!connected ? (
        <div className="glass mt-6 rounded-2xl p-8 text-sm text-[var(--color-slate)]">
          Not connected to a database right now — try again shortly.
        </div>
      ) : users.length === 0 ? (
        <div className="glass mt-6 rounded-2xl p-8 text-sm text-[var(--color-slate)]">
          Nothing in the trash.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {users.map((u) => (
            <li key={u.id} className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="mt-1 text-xs text-[var(--color-slate)]">
                  {u.originalEmail ?? "No original email on file"}
                  {u.phone ? ` · ${u.phone}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--color-slate)]">
                  {u.client && (
                    <span className="flex items-center gap-1">
                      <Users size={12} /> Client{u.client.name ? `: ${u.client.name}` : ""}
                    </span>
                  )}
                  {u.referralPartner && (
                    <span className="flex items-center gap-1">
                      <Handshake size={12} /> Referral partner ({u.referralPartner.referralCode})
                    </span>
                  )}
                  <span>Deleted {u.deletedAt ? new Date(u.deletedAt).toLocaleDateString() : "—"}</span>
                </div>
              </div>
              <form action={restoreUserAccountAction}>
                <input type="hidden" name="userId" value={u.id} />
                <ConfirmSubmit
                  message={`Restore ${u.name}'s account? Their original email (${u.originalEmail ?? "unknown"}) becomes active again, but they'll need to reset their password to sign in.`}
                  title="Restore account"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium transition hover:border-[var(--color-brass)] hover:text-[var(--color-brass)]"
                >
                  <RotateCcw size={14} /> Restore
                </ConfirmSubmit>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
