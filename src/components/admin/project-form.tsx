"use client";

import { ImageUpload } from "./image-upload";
import { GalleryUpload } from "./gallery-upload";

type ProjectFormValues = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  industry: string;
  problem: string;
  solution: string;
  results: string;
  durationWeeks: number | null;
  liveUrl: string | null;
  githubUrl: string | null;
  coverImage: string | null;
  technologies: string[];
  featured: boolean;
  hidden: boolean;
  clientName?: string;
  gallery?: string[];
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]";
const labelClass = "mb-1.5 block text-xs font-medium text-[var(--color-slate)]";

export function ProjectForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  defaultValues?: Partial<ProjectFormValues>;
}) {
  return (
    <form action={action} className="glass space-y-5 rounded-2xl p-8">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Title</label>
          <input
            name="title"
            required
            defaultValue={defaultValues?.title}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Slug (leave blank to auto-generate)</label>
          <input name="slug" defaultValue={defaultValues?.slug} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Summary</label>
        <textarea
          name="summary"
          required
          rows={2}
          defaultValue={defaultValues?.summary}
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Client name</label>
          <input
            name="clientName"
            defaultValue={defaultValues?.clientName}
            placeholder="e.g. Riverside Hotel"
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-[var(--color-slate)]">
            Auto-creates the client if it doesn&apos;t exist yet, shows up on /clients immediately.
          </p>
        </div>
        <div>
          <label className={labelClass}>Industry</label>
          <input
            name="industry"
            required
            defaultValue={defaultValues?.industry}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Duration (weeks)</label>
          <input
            name="durationWeeks"
            type="number"
            min={1}
            defaultValue={defaultValues?.durationWeeks ?? undefined}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Technologies (comma-separated)</label>
        <input
          name="technologies"
          defaultValue={defaultValues?.technologies?.join(", ")}
          placeholder="Next.js, PostgreSQL, Paystack"
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Problem</label>
          <textarea
            name="problem"
            required
            rows={4}
            defaultValue={defaultValues?.problem}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Solution</label>
          <textarea
            name="solution"
            required
            rows={4}
            defaultValue={defaultValues?.solution}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Results</label>
          <textarea
            name="results"
            required
            rows={4}
            defaultValue={defaultValues?.results}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <ImageUpload
          name="coverImage"
          label="Cover image"
          defaultValue={defaultValues?.coverImage}
          folder="nobs-agent/portfolio"
        />
        <div className="grid gap-5">
          <div>
            <label className={labelClass}>Live URL</label>
            <input
              name="liveUrl"
              type="url"
              defaultValue={defaultValues?.liveUrl ?? undefined}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>GitHub URL</label>
            <input
              name="githubUrl"
              type="url"
              defaultValue={defaultValues?.githubUrl ?? undefined}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <GalleryUpload defaultValues={defaultValues?.gallery ?? []} />

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={defaultValues?.featured}
            className="h-4 w-4 accent-[var(--color-brass)]"
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="hidden"
            defaultChecked={defaultValues?.hidden}
            className="h-4 w-4 accent-[var(--color-brass)]"
          />
          Hidden from public site
        </label>
      </div>

      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
      >
        {defaultValues?.id ? "Save changes" : "Create project"}
      </button>
    </form>
  );
}
