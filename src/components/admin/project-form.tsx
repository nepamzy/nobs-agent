"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ImageUpload } from "./image-upload";
import { GalleryUpload } from "./gallery-upload";
import type { ProjectFormState } from "@/app/admin/portfolio/actions";

type ProjectFormValues = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  industry: string;
  problem: string;
  solution: string;
  results: string;
  constraints?: string | null;
  architecture?: string | null;
  keyEngineeringDecisions?: string | null;
  security?: string | null;
  performance?: string | null;
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

// Submits via useActionState — not a bare `action={fn}` — so a thrown
// validation or database error comes back as state the form can show
// inline, instead of crashing straight to Next.js's generic error screen
// with no indication of what was wrong (see the comment on createProject
// in actions.ts for how that used to read to an admin: "I can't add a
// project").
function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Saving…" : isEdit ? "Save changes" : "Create project"}
    </button>
  );
}

export function ProjectForm({
  action,
  defaultValues,
}: {
  action: (prevState: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  defaultValues?: Partial<ProjectFormValues>;
}) {
  const [state, formAction] = useActionState<ProjectFormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="glass space-y-5 rounded-2xl p-8">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}

      {state?.error && (
        <div className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="project-form-title" className={labelClass}>Title</label>
          <input
            id="project-form-title"
            name="title"
            required
            defaultValue={defaultValues?.title}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="project-form-slug" className={labelClass}>Slug (leave blank to auto-generate)</label>
          <input id="project-form-slug" name="slug" defaultValue={defaultValues?.slug} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="project-form-summary" className={labelClass}>Summary</label>
        <textarea
          id="project-form-summary"
          name="summary"
          required
          rows={2}
          defaultValue={defaultValues?.summary}
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="project-form-client-name" className={labelClass}>Client name</label>
          <input
            id="project-form-client-name"
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
          <label htmlFor="project-form-industry" className={labelClass}>Industry</label>
          <input
            id="project-form-industry"
            name="industry"
            required
            defaultValue={defaultValues?.industry}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="project-form-duration-weeks" className={labelClass}>Duration (weeks)</label>
          <input
            id="project-form-duration-weeks"
            name="durationWeeks"
            type="number"
            min={1}
            defaultValue={defaultValues?.durationWeeks ?? undefined}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="project-form-technologies" className={labelClass}>Technologies (comma-separated)</label>
        <input
          id="project-form-technologies"
          name="technologies"
          defaultValue={defaultValues?.technologies?.join(", ")}
          placeholder="Next.js, PostgreSQL, Paystack"
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="project-form-problem" className={labelClass}>Problem</label>
          <textarea
            id="project-form-problem"
            name="problem"
            required
            rows={4}
            defaultValue={defaultValues?.problem}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="project-form-solution" className={labelClass}>Solution</label>
          <textarea
            id="project-form-solution"
            name="solution"
            required
            rows={4}
            defaultValue={defaultValues?.solution}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="project-form-results" className={labelClass}>Results</label>
          <textarea
            id="project-form-results"
            name="results"
            required
            rows={4}
            defaultValue={defaultValues?.results}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-1 font-[family-name:var(--font-display)] text-sm font-medium text-[var(--color-paper)]">
          Engineering deep dive
        </h3>
        <p className="mb-4 text-[11px] text-[var(--color-slate)]">
          All optional. Fill in what applies to this project, shown on the case study/detail page
          when present, hidden entirely when left blank.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="project-form-constraints" className={labelClass}>Constraints</label>
            <textarea
              id="project-form-constraints"
              name="constraints"
              rows={4}
              defaultValue={defaultValues?.constraints ?? undefined}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="project-form-architecture" className={labelClass}>Architecture</label>
            <textarea
              id="project-form-architecture"
              name="architecture"
              rows={4}
              defaultValue={defaultValues?.architecture ?? undefined}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="project-form-key-engineering-decisions" className={labelClass}>Key engineering decisions</label>
            <textarea
              id="project-form-key-engineering-decisions"
              name="keyEngineeringDecisions"
              rows={4}
              defaultValue={defaultValues?.keyEngineeringDecisions ?? undefined}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="project-form-security" className={labelClass}>Security</label>
            <textarea
              id="project-form-security"
              name="security"
              rows={4}
              defaultValue={defaultValues?.security ?? undefined}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="project-form-performance" className={labelClass}>Performance</label>
            <textarea
              id="project-form-performance"
              name="performance"
              rows={4}
              defaultValue={defaultValues?.performance ?? undefined}
              className={inputClass}
            />
          </div>
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
            <label htmlFor="project-form-live-url" className={labelClass}>Live URL</label>
            {/* type="text", not "url" — the browser's own url-input
                validation silently blocks submitting the whole form on
                something like "example.com" with no scheme, with no
                visible message beyond a small native tooltip. The server
                action normalizes a bare domain to https:// and gives a
                real, visible error for anything it still can't parse. */}
            <input
              id="project-form-live-url"
              name="liveUrl"
              type="text"
              inputMode="url"
              placeholder="example.com"
              defaultValue={defaultValues?.liveUrl ?? undefined}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="project-form-github-url" className={labelClass}>GitHub URL</label>
            <input
              id="project-form-github-url"
              name="githubUrl"
              type="text"
              inputMode="url"
              placeholder="github.com/your-org/your-repo"
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

      <SubmitButton isEdit={Boolean(defaultValues?.id)} />
    </form>
  );
}
