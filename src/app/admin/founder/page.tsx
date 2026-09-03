import { prisma } from "@/lib/prisma";
import { ImageUpload } from "@/components/admin/image-upload";
import { saveFounder } from "./actions";

async function getFounderRow() {
  try {
    return await prisma.founder.findFirst();
  } catch {
    return null;
  }
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]";
const labelClass = "mb-1.5 block text-xs font-medium text-[var(--color-slate)]";

export default async function AdminFounderPage() {
  const founder = await getFounderRow();

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Engineer / Founder Profile
      </h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--color-slate)]">
        This is the &quot;The Engineer Behind NOBS&quot; section shown at the bottom of{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5">/about</code>. Until you save
        something here, the page falls back to placeholder defaults.
      </p>

      <form action={saveFounder} className="glass mt-8 space-y-5 rounded-2xl p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="founder-name" className={labelClass}>Name</label>
            <input id="founder-name" name="name" required defaultValue={founder?.name} className={inputClass} />
          </div>
          <div>
            <label htmlFor="founder-role" className={labelClass}>Role</label>
            <input
              id="founder-role"
              name="role"
              required
              defaultValue={founder?.role}
              placeholder="Founder & Full-stack Engineer / Systems Builder"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="founder-bio" className={labelClass}>Bio</label>
          <textarea
            id="founder-bio"
            name="bio"
            required
            rows={5}
            defaultValue={founder?.bio}
            className={inputClass}
          />
        </div>

        <ImageUpload
          name="photoUrl"
          label="Photo"
          defaultValue={founder?.photoUrl}
          folder="nobs-agent/founder"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="founder-github-url" className={labelClass}>GitHub URL</label>
            <input
              id="founder-github-url"
              name="githubUrl"
              type="url"
              defaultValue={founder?.githubUrl ?? undefined}
              placeholder="https://github.com/username"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="founder-linkedin-url" className={labelClass}>LinkedIn URL (optional)</label>
            <input
              id="founder-linkedin-url"
              name="linkedinUrl"
              type="url"
              defaultValue={founder?.linkedinUrl ?? undefined}
              placeholder="https://linkedin.com/in/username"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
        >
          Save
        </button>
      </form>
    </div>
  );
}
