import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateProfile, updateNotificationPreference } from "./actions";
import { ChangePasswordForm } from "@/components/change-password-form";

async function getClientRecord(userId: string) {
  try {
    return await prisma.client.findUnique({ where: { userId } });
  } catch {
    return null;
  }
}

async function getUserRecord(userId: string) {
  try {
    return await prisma.user.findUnique({ where: { id: userId } });
  } catch {
    return null;
  }
}

export default async function SettingsPage() {
  const session = await auth();
  const [client, user] = await Promise.all([
    getClientRecord(session!.user.id),
    getUserRecord(session!.user.id),
  ]);

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Settings
      </h1>

      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-medium">
          Profile
        </h2>
        <form action={updateProfile} className="space-y-4">
          <div>
            <label htmlFor="settings-name" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
              Full name
            </label>
            <input
              id="settings-name"
              name="name"
              defaultValue={session!.user.name ?? ""}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-brass)]"
            />
          </div>
          <div>
            <label htmlFor="settings-organization" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
              Organization
            </label>
            <input
              id="settings-organization"
              name="organization"
              defaultValue={client?.organization ?? ""}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-brass)]"
            />
          </div>
          <div>
            <label htmlFor="settings-email" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
              Email
            </label>
            <input
              id="settings-email"
              value={session!.user.email ?? ""}
              disabled
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[var(--color-slate)] outline-none"
            />
            <p className="mt-1 text-xs text-[var(--color-slate)]">
              Contact the studio to change your email address.
            </p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
          >
            Save profile
          </button>
        </form>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-medium">
          Password
        </h2>
        <ChangePasswordForm />
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-medium">
          Notifications
        </h2>
        <form action={updateNotificationPreference}>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="emailNotifications"
              defaultChecked={user?.emailNotifications !== false}
              className="h-4 w-4 accent-[var(--color-brass)]"
            />
            Email me about project updates and payment confirmations
          </label>
          <button
            type="submit"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-medium transition hover:border-[var(--color-brass)]"
          >
            Save preference
          </button>
        </form>
      </div>
    </div>
  );
}
