"use client";

type JobFormValues = {
  id?: string;
  title: string;
  department: string | null;
  location: string;
  type: string;
  description: string;
  requirements: string | null;
  active: boolean;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]";
const labelClass = "mb-1.5 block text-xs font-medium text-[var(--color-slate)]";

export function JobForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  defaultValues?: Partial<JobFormValues>;
}) {
  return (
    <form action={action} className="glass space-y-5 rounded-2xl p-8">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <div>
        <label htmlFor="job-form-title" className={labelClass}>Job title</label>
        <input id="job-form-title" name="title" required defaultValue={defaultValues?.title} className={inputClass} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="job-form-department" className={labelClass}>Department (optional)</label>
          <input
            id="job-form-department"
            name="department"
            defaultValue={defaultValues?.department ?? undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="job-form-location" className={labelClass}>Location</label>
          <input
            id="job-form-location"
            name="location"
            required
            defaultValue={defaultValues?.location ?? "Remote"}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="job-form-type" className={labelClass}>Type</label>
          <select
            id="job-form-type"
            name="type"
            defaultValue={defaultValues?.type ?? "Full-time"}
            className={inputClass}
          >
            <option value="Full-time" className="bg-[var(--color-ink)]">Full-time</option>
            <option value="Part-time" className="bg-[var(--color-ink)]">Part-time</option>
            <option value="Contract" className="bg-[var(--color-ink)]">Contract</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="job-form-description" className={labelClass}>Description</label>
        <textarea
          id="job-form-description"
          name="description"
          required
          rows={6}
          defaultValue={defaultValues?.description}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="job-form-requirements" className={labelClass}>Requirements (optional)</label>
        <textarea
          id="job-form-requirements"
          name="requirements"
          rows={5}
          defaultValue={defaultValues?.requirements ?? undefined}
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={defaultValues?.active ?? true}
          className="h-4 w-4 accent-[var(--color-brass)]"
        />
        Open for applications
      </label>

      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
      >
        {defaultValues?.id ? "Save changes" : "Create posting"}
      </button>
    </form>
  );
}
